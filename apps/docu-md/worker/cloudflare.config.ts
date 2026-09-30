import { bindings, defineConfig } from "cf/config";
import * as entrypoint from "./src/index.ts" with { type: "cf-worker" };

// docu-md PDF export backend. Deploy: `cfx deploy` (or `bun run deploy`) from this folder.
export default defineConfig({
	worker: {
		name: "docu-md-pdf",
		compatibilityDate: "2026-09-25",
		compatibilityFlags: ["nodejs_compat"],
		entrypoint,
		env: {
			// Cloudflare Browser Rendering (headless Chromium) — used via @cloudflare/puppeteer.
			BROWSER: bindings.browser(),
			// Per-IP limiter: 6 PDF renders / minute. Namespace id is an arbitrary account-unique integer.
			RATE_LIMITER: bindings.rateLimit({ namespace: "2701", simple: { limit: 6, period: 60 } }),
		},
	},
});
