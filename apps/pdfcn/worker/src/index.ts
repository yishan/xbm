// pdfcn PDF export Worker — deployed with the Cloudflare cf CLI (cf deploy).

import puppeteer from "@cloudflare/puppeteer";
import type { Browser, Page } from "@cloudflare/puppeteer";

const ALLOWED_ORIGIN = "https://li.yishan.app";
const MAX_BYTES = 2 * 1024 * 1024;

type RateLimiter = {
	limit(options: { key: string }): Promise<{ success: boolean }>;
};

export type Env = {
	BROWSER: Fetcher;
	RATE_LIMITER: RateLimiter;
};

/**
 * Pure origin allow-list: the production origin, plus any http://localhost:<port>
 * or http://127.0.0.1:<port> (port optional). Protocol + hostname are compared
 * after URL parsing — never substrings or suffix checks.
 */
export function isAllowedOrigin(origin: string | null): boolean {
	if (!origin) return false;

	let url: URL;
	try {
		url = new URL(origin);
	} catch {
		return false;
	}

	if (url.protocol === "https:") return url.origin === ALLOWED_ORIGIN;
	if (url.protocol === "http:") {
		return url.hostname === "localhost" || url.hostname === "127.0.0.1";
	}
	return false;
}

function corsHeaders(origin: string | null): Record<string, string> {
	if (origin === null || !isAllowedOrigin(origin)) return {};
	return {
		"Access-Control-Allow-Origin": origin,
		Vary: "Origin",
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
		"Access-Control-Max-Age": "86400",
		"Access-Control-Expose-Headers": "Content-Disposition, Retry-After",
	};
}

function jsonError(
	status: number,
	error: string,
	origin: string | null,
	extra: Record<string, string> = {},
): Response {
	return new Response(JSON.stringify({ error }), {
		status,
		headers: {
			...corsHeaders(origin),
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "no-store",
			...extra,
		},
	});
}

/** Keep [A-Za-z0-9._-], drop any .pdf suffix, cap at 80 chars, force .pdf. */
function safeFilename(input: string | undefined): string {
	const stem = (input ?? "")
		.replace(/[^A-Za-z0-9._-]/g, "")
		.replace(/\.pdf$/i, "")
		.slice(0, 80);
	return `${stem.length > 0 ? stem : "pdfcn"}.pdf`;
}

function parseJsonBody(raw: ArrayBuffer): unknown {
	return JSON.parse(new TextDecoder().decode(raw));
}

export default {
	async fetch(request, env): Promise<Response> {
		const { pathname } = new URL(request.url);
		const origin = request.headers.get("Origin");

		if (request.method === "OPTIONS") {
			if (!isAllowedOrigin(origin)) return jsonError(403, "origin not allowed", origin);
			return new Response(null, { status: 204, headers: corsHeaders(origin) });
		}

		if (request.method === "GET" && (pathname === "/" || pathname === "/health")) {
			return new Response(JSON.stringify({ ok: true, service: "pdfcn-pdf" }), {
				headers: {
					...corsHeaders(origin),
					"Content-Type": "application/json; charset=utf-8",
					"Cache-Control": "no-store",
				},
			});
		}

		if (request.method === "POST" && pathname === "/pdf") {
			return renderPdf(request, env, origin);
		}

		return jsonError(404, "not found", origin);
	},
} satisfies ExportedHandler<Env>;

/**
 * Reuse an idle Browser Rendering session when one is free; otherwise launch a
 * fresh browser that stays alive 60 s after we disconnect, so the next request
 * can pick it up instead of hitting the launch rate limit.
 */
async function acquireBrowser(endpoint: Env["BROWSER"]): Promise<Browser> {
	try {
		const sessions = await puppeteer.sessions(endpoint);
		const reusable = sessions.filter((session) => !session.connectionId);
		const session = reusable[Math.floor(Math.random() * reusable.length)];
		if (session) {
			try {
				return await puppeteer.connect(endpoint, session.sessionId);
			} catch {
				// Session became contended or vanished — fall through to a fresh launch.
			}
		}
	} catch {
		// sessions() unavailable — fall through to a fresh launch.
	}
	return puppeteer.launch(endpoint, { keep_alive: 60000 });
}

async function renderPdf(request: Request, env: Env, origin: string | null): Promise<Response> {
	// 1. Abuse protection: callers must present an allowed Origin.
	if (!isAllowedOrigin(origin)) return jsonError(403, "origin not allowed", origin);

	// 2. Content-Type.
	const contentType = request.headers.get("Content-Type") ?? "";
	if (!contentType.toLowerCase().startsWith("application/json")) {
		return jsonError(415, "unsupported media type", origin);
	}

	// 3. Size cap — declared length first (may be missing or lying), then actual bytes.
	const declaredBytes = Number(request.headers.get("Content-Length") ?? "0");
	if (declaredBytes > MAX_BYTES) return jsonError(413, "payload too large", origin);

	const raw = await request.arrayBuffer();
	if (raw.byteLength > MAX_BYTES) return jsonError(413, "payload too large", origin);

	// 4. Rate limit.
	const key = request.headers.get("cf-connecting-ip") ?? "anon";
	const { success } = await env.RATE_LIMITER.limit({ key });
	if (!success) {
		return jsonError(429, "rate limited", origin, { "Retry-After": "60" });
	}

	// 5. Parse and validate the payload.
	let body: unknown;
	try {
		body = parseJsonBody(raw);
	} catch {
		return jsonError(400, "invalid json", origin);
	}

	const { html, filename } = (body ?? {}) as { html?: unknown; filename?: unknown };
	if (typeof html !== "string" || html.trim().length === 0 || !html.includes("<")) {
		return jsonError(400, "html must be a non-empty string containing markup", origin);
	}

	const outputName = safeFilename(typeof filename === "string" ? filename : undefined);

	let browser: Browser | null = null;
	let page: Page | null = null;
	try {
		browser = await acquireBrowser(env.BROWSER);
		page = await browser.newPage();

		// The HTML is a static snapshot of the React preview; no scripts needed.
		await page.setJavaScriptEnabled(false);

		// Block every network request except inline data: URIs — prevents SSRF.
		await page.setRequestInterception(true);
		page.on("request", (req) => {
			const target = req.url();
			const allowed = target.startsWith("data:") || target === "about:blank";
			void (allowed ? req.continue() : req.abort()).catch(() => {});
		});

		await page.setViewport({ width: 794, height: 1123 });
		await page.emulateMediaType("screen");
		await page.setContent(html, { waitUntil: "load", timeout: 15000 });

		const pdf = await page.pdf({
			format: "A4",
			printBackground: true,
			// The caller sends @page { size: A4; margin: 0 } and paints a full-bleed background itself.
			preferCSSPageSize: true,
			margin: { top: "0", bottom: "0", left: "0", right: "0" },
			timeout: 20000,
		});

		return new Response(pdf, {
			headers: {
				...corsHeaders(origin),
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="${outputName}"`,
				"Cache-Control": "no-store",
				"X-Content-Type-Options": "nosniff",
			},
		});
	} catch (error) {
		// Never log the HTML payload.
		const message = error instanceof Error ? error.message : String(error);
		console.error("pdf render failed:", message);
		if (/429|rate limit/i.test(message)) {
			return jsonError(
				503,
				"PDF renderer busy (Cloudflare Browser Rendering limit) — retry in a few seconds",
				origin,
				{ "Retry-After": "10" },
			);
		}
		return jsonError(502, "render failed", origin);
	} finally {
		await page?.close().catch(() => {});
		// disconnect() (not close()) leaves the browser alive for the keep_alive window.
		try {
			await browser?.disconnect();
		} catch {
			// Connection already gone; nothing left to release.
		}
	}
}
