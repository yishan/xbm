export function SiteFooter() {
  return (
    <footer className="border-t mt-10">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 text-xs text-muted-foreground space-y-1">
        <p>
          Charts rendered with{" "}
          <a
            href="https://github.com/TanStack/charts"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-4 hover:underline"
          >
            TanStack Charts 1.0
          </a>{" "}
          (@tanstack/charts + @tanstack/charts/react) by TanStack —{" "}
          <a
            href="https://github.com/TanStack/charts/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-4 hover:underline"
          >
            MIT License
          </a>
          . This demo is not affiliated with TanStack.
        </p>
        <p>
          Data: the yishan/xbm git history and two articles quoted in Nutrient&apos;s 2026-10-06
          Readwise brief. Each chart cites its source.
        </p>
        <p>
          Source post:{" "}
          <a
            href="https://x.com/tan_stack/status/2107141729111736483"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-4 hover:underline"
          >
            @tan_stack on X
          </a>
        </p>
      </div>
    </footer>
  )
}
