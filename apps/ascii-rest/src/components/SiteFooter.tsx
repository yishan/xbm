import type { ReactNode } from "react";

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline-offset-2 hover:underline"
    >
      {children}
    </a>
  );
}

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border max-w-6xl mx-auto px-4 py-8 text-xs text-muted-foreground font-mono">
      <p>
        pieces by <ExternalLink href="https://ascii.rest">ascii.rest</ExternalLink> 0.2.1 — MIT ©{" "}
        <ExternalLink href="https://github.com/bas3line">@bas3line</ExternalLink> ·{" "}
        <ExternalLink href="https://github.com/bas3line/ascii">source</ExternalLink>
      </p>
      <p className="mt-2">
        found via{" "}
        <ExternalLink href="https://x.com/inlovewithgo/status/2107800389395636271">
          x.com/inlovewithgo/status/2107800389395636271
        </ExternalLink>{" "}
        · xbm nightly demo 2026-10-09
      </p>
      <p className="mt-2">
        pinned to exactly 0.2.1; the 3-day release-age rule is waived for this one package (it
        was published 2026-10-08).
      </p>
    </footer>
  );
}
