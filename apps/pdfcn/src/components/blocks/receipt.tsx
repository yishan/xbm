// Showcase inspired by shadcn-labs/pdfcn (MIT). https://github.com/shadcn-labs/pdfcn

type LineItem = {
  name: string;
  detail?: string;
  amount: number;
};

const ITEMS: LineItem[] = [
  { name: "Espresso blend 250g", amount: 14.5 },
  { name: "Oat latte", detail: "2 × 4.50", amount: 9.0 },
  { name: "Croissant", amount: 3.75 },
  { name: "Pour-over kit", amount: 28.0 },
  { name: "Loyalty discount", amount: -5.0 },
];

const SUBTOTAL = 50.25;
const TAX = 4.27;
const TIP = 6.0;
const TOTAL = 60.52;

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function ReceiptBlock() {
  return (
    <div
      data-testid="doc-receipt"
      className="mx-auto w-full max-w-[420px] rounded-xl px-8 py-10 text-[13px] leading-relaxed"
      style={{
        backgroundColor: "var(--pdf-bg)",
        color: "var(--pdf-fg)",
        border: "1px solid var(--pdf-border)",
      }}
    >
      {/* Merchant header */}
      <header className="text-center">
        <h1
          className="text-lg font-semibold tracking-tight"
          style={{ color: "var(--pdf-heading)" }}
        >
          Cascade Coffee Roasters
        </h1>
        <p className="mt-1" style={{ color: "var(--pdf-muted)" }}>
          128 Rainier Ave S, Seattle, WA 98144
        </p>
        <p className="mt-1 tabular-nums" style={{ color: "var(--pdf-muted)" }}>
          ORD-918274 · Oct 4 2026 14:22
        </p>
      </header>

      {/* Divider */}
      <div
        className="my-6 border-t border-dashed"
        style={{ borderColor: "var(--pdf-border)" }}
      />

      {/* Items */}
      <ul className="space-y-3">
        {ITEMS.map((item) => (
          <li key={item.name} className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p
                className="truncate"
                style={{
                  color:
                    item.amount < 0
                      ? "var(--pdf-accent)"
                      : "var(--pdf-fg)",
                }}
              >
                {item.name}
              </p>
              {item.detail ? (
                <p className="tabular-nums" style={{ color: "var(--pdf-muted)" }}>
                  {item.detail}
                </p>
              ) : null}
            </div>
            <span className="shrink-0 tabular-nums">{formatMoney(item.amount)}</span>
          </li>
        ))}
      </ul>

      {/* Divider */}
      <div
        className="my-6 border-t border-dashed"
        style={{ borderColor: "var(--pdf-border)" }}
      />

      {/* Totals */}
      <dl className="space-y-2 tabular-nums">
        <div className="flex items-center justify-between">
          <dt style={{ color: "var(--pdf-muted)" }}>Subtotal</dt>
          <dd>{formatMoney(SUBTOTAL)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt style={{ color: "var(--pdf-muted)" }}>Tax</dt>
          <dd>{formatMoney(TAX)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt style={{ color: "var(--pdf-muted)" }}>Tip</dt>
          <dd>{formatMoney(TIP)}</dd>
        </div>
        <div
          className="mt-3 flex items-center justify-between border-t pt-3 text-base font-semibold"
          style={{ borderColor: "var(--pdf-border)", color: "var(--pdf-heading)" }}
        >
          <dt>Total</dt>
          <dd>{formatMoney(TOTAL)}</dd>
        </div>
      </dl>

      {/* Payment */}
      <div className="mt-6 flex items-center justify-between">
        <span
          className="rounded-md px-2 py-1 text-[11px] font-medium uppercase tracking-wide"
          style={{
            backgroundColor: "var(--pdf-accent)",
            color: "var(--pdf-accent-fg)",
          }}
        >
          Paid
        </span>
        <span className="tabular-nums" style={{ color: "var(--pdf-muted)" }}>
          Visa •••• 4242
        </span>
      </div>

      {/* Footer */}
      <p
        className="mt-8 text-center text-xs"
        style={{ color: "var(--pdf-muted)" }}
      >
        Thank you — see you tomorrow
      </p>
    </div>
  );
}
