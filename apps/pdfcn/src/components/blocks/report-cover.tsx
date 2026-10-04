// Showcase inspired by shadcn-labs/pdfcn (MIT). https://github.com/shadcn-labs/pdfcn

export function ReportCoverBlock() {
  return (
    <section
      data-testid="doc-report-cover"
      className="relative flex min-h-[640px] w-full flex-col"
      style={{
        color: "var(--pdf-fg)",
      }}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-2.5"
        style={{ background: "var(--pdf-accent)" }}
      />

      <div className="flex flex-1 flex-col justify-between pl-9 pr-8 pt-12 pb-10 sm:pl-16 sm:pr-14 sm:pt-16 sm:pb-14">
        <header className="flex items-center justify-between gap-4">
          <span
            className="inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.28em]"
            style={{ color: "var(--pdf-muted)" }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: "var(--pdf-accent)" }}
            />
            Q4 2026 Strategy
          </span>
          <span
            className="hidden text-[0.7rem] uppercase tracking-[0.28em] sm:inline"
            style={{ color: "var(--pdf-muted)" }}
          >
            Northwind Studio
          </span>
        </header>

        <div className="max-w-[36rem]">
          <h1
            className="text-[2.35rem] font-semibold leading-[1.05] tracking-tight sm:text-[3.4rem]"
            style={{ color: "var(--pdf-heading)" }}
          >
            Operating System for Design Quality
          </h1>
          <div
            className="mt-7 h-px w-24"
            style={{ background: "var(--pdf-accent)" }}
          />
          <p
            className="mt-7 max-w-[30rem] text-base leading-relaxed sm:text-lg"
            style={{ color: "var(--pdf-muted)" }}
          >
            How Northwind Studio scales craft across 12 product teams
          </p>
        </div>

        <footer className="flex flex-col gap-4">
          <p
            className="text-[0.7rem] uppercase tracking-[0.22em]"
            style={{ color: "var(--pdf-muted)" }}
          >
            Prepared for Executive Leadership · Confidential · Oct 2026
          </p>
          <div
            className="flex items-end justify-between gap-6 border-t pt-5"
            style={{ borderColor: "var(--pdf-border)" }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--pdf-fg)" }}>
              Avery Chen, Design Ops
            </p>
            <span
              className="text-xs tabular-nums"
              style={{ color: "var(--pdf-muted)" }}
            >
              01 / Cover
            </span>
          </div>
        </footer>
      </div>
    </section>
  );
}
