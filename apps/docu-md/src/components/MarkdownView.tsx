// Showcase UI inspired by docu.md (https://docu.md/). Re-implemented with a permissive stack.
// Do not vendor GPLv3 engines from markdown-viewer.

import { Fragment } from "react";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.min.css";

import { MermaidBlock } from "@/components/MermaidBlock";
import { ArchitectureSvg } from "@/components/ArchitectureSvg";
import { cn } from "@/lib/utils";

type MarkdownViewProps = {
  source: string;
};

const ARCHITECTURE_MARKER = "<!-- architecture-svg -->";

type CalloutKind = "callout" | "info" | "warning" | "intention";

const calloutStyles: Record<CalloutKind, string> = {
  callout:
    "border-rose-400 bg-rose-50 text-rose-950 dark:bg-rose-950/40 dark:text-rose-100",
  info: "border-sky-400 bg-sky-50 text-sky-950 dark:bg-sky-950/40 dark:text-sky-100",
  warning:
    "border-amber-400 bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100",
  intention:
    "border-violet-400 bg-violet-50 text-violet-950 dark:bg-violet-950/40 dark:text-violet-100",
};

function extractText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map((child) => extractText(child)).join("");
  if (typeof node === "object" && node !== null && "props" in node) {
    const element = node as { props?: { children?: ReactNode } };
    return extractText(element.props?.children);
  }
  return "";
}

function detectCallout(children: ReactNode): CalloutKind | null {
  const text = extractText(children).trim();
  const match = /^(callout|info|warning|intention):/i.exec(text);
  if (!match) return null;
  return match[1].toLowerCase() as CalloutKind;
}

function MarkdownContent({ source }: { source: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        pre: ({ children }) => <>{children}</>,
        code: ({ node: _node, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className ?? "");
          const content = String(children);

          if (match?.[1] === "mermaid") {
            return <MermaidBlock code={content.replace(/\n$/, "")} />;
          }

          const isInline = !className && !content.includes("\n");
          if (isInline) {
            return (
              <code
                className="rounded bg-muted px-1 py-0.5 text-[0.85em]"
                {...props}
              >
                {children}
              </code>
            );
          }

          return (
            <pre className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-100">
              <code className={className} {...props}>
                {content.replace(/\n$/, "")}
              </code>
            </pre>
          );
        },
        table: ({ node: _node, children, ...props }) => (
          <div className="my-4 w-full overflow-x-auto">
            <table
              className="w-full border-collapse text-sm"
              {...props}
            >
              {children}
            </table>
          </div>
        ),
        th: ({ node: _node, children, ...props }) => (
          <th
            className="border border-border bg-muted/50 px-3 py-2 text-left font-semibold"
            {...props}
          >
            {children}
          </th>
        ),
        td: ({ node: _node, children, ...props }) => (
          <td className="border border-border px-3 py-2 align-top" {...props}>
            {children}
          </td>
        ),
        blockquote: ({ node: _node, children, ...props }) => {
          const kind = detectCallout(children);
          if (kind) {
            return (
              <blockquote
                className={cn(
                  "my-4 rounded-xl border border-transparent border-l-4 p-4",
                  calloutStyles[kind]
                )}
                {...props}
              >
                {children}
              </blockquote>
            );
          }
          return (
            <blockquote
              className="my-4 border-l-4 border-border pl-4 italic text-muted-foreground"
              {...props}
            >
              {children}
            </blockquote>
          );
        },
        a: ({ node: _node, children, ...props }) => (
          <a
            className="text-sky-600 underline underline-offset-2 hover:text-sky-500 dark:text-sky-400"
            target="_blank"
            rel="noreferrer"
            {...props}
          >
            {children}
          </a>
        ),
        h1: ({ node: _node, children, ...props }) => (
          <h1
            className="mt-6 text-3xl font-bold tracking-tight"
            {...props}
          >
            {children}
          </h1>
        ),
        h2: ({ node: _node, children, ...props }) => (
          <h2
            className="mt-8 border-b pb-2 text-xl font-semibold tracking-tight"
            {...props}
          >
            {children}
          </h2>
        ),
        h3: ({ node: _node, children, ...props }) => (
          <h3
            className="mt-6 text-lg font-semibold tracking-tight"
            {...props}
          >
            {children}
          </h3>
        ),
        img: ({ node: _node, ...props }) => (
          <img className="max-w-full rounded" {...props} />
        ),
      }}
    >
      {source}
    </ReactMarkdown>
  );
}

export function MarkdownView({ source }: MarkdownViewProps) {
  const segments = source.split(ARCHITECTURE_MARKER);

  return (
    <div
      className="markdown-body space-y-3 text-[15px] leading-relaxed text-foreground"
      data-testid="markdown-view"
    >
      {segments.map((segment, index) => (
        <Fragment key={index}>
          {segment.trim().length > 0 && <MarkdownContent source={segment} />}
          {index < segments.length - 1 && <ArchitectureSvg />}
        </Fragment>
      ))}
    </div>
  );
}
