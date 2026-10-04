// Showcase inspired by shadcn-labs/pdfcn (MIT). https://github.com/shadcn-labs/pdfcn

type LineItem = {
  description: string;
  detail: string;
  qty: number;
  unit: number;
  amount: number;
};

const LINE_ITEMS: LineItem[] = [
  {
    description: "Brand identity refresh",
    detail: "Logo system, type scale, color tokens",
    qty: 1,
    unit: 4800,
    amount: 4800,
  },
  {
    description: "Landing page design",
    detail: "Hero, feature grid, pricing",
    qty: 1,
    unit: 3200,
    amount: 3200,
  },
  {
    description: "Component library",
    detail: "24 primitives, docs, tokens",
    qty: 1,
    unit: 2400,
    amount: 2400,
  },
  {
    description: "Design QA",
    detail: "Cross-browser + a11y pass",
    qty: 3,
    unit: 300,
    amount: 900,
  },
];

const SUBTOTAL = LINE_ITEMS.reduce((sum, item) => sum + item.amount, 0);
const TAX_RATE = 0.085;
const TAX = SUBTOTAL * TAX_RATE;
const TOTAL = SUBTOTAL + TAX;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const number = new Intl.NumberFormat("en-US");

export function InvoiceBlock() {
  return (
    <article
      data-testid="doc-invoice"
      className="flex min-h-full w-full flex-col text-[13px] leading-relaxed text-[color:var(--pdf-fg)]"
    >
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-3.5 w-1.5 rounded-full bg-[color:var(--pdf-accent)]"
            />
            <h1 className="text-base font-semibold tracking-tight text-[color:var(--pdf-heading)]">
              Northwind Studio LLC
            </h1>
          </div>
          <p className="text-[color:var(--pdf-muted)]">
            120 Market St
            <br />
            San Francisco, CA
          </p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-semibold uppercase tracking-[0.24em] text-[color:var(--pdf-accent)]">
            Invoice
          </p>
          <p className="mt-1 tabular-nums text-[color:var(--pdf-muted)]">
            INV-2026-0842
          </p>
        </div>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-8 border-t border-[color:var(--pdf-border)] pt-8 sm:grid-cols-3">
        <section className="space-y-1">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--pdf-muted)]">
            Invoice number
          </h2>
          <p className="tabular-nums text-[color:var(--pdf-heading)]">
            INV-2026-0842
          </p>
        </section>

        <section className="space-y-1">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--pdf-muted)]">
            Dates
          </h2>
          <dl className="space-y-1 tabular-nums">
            <div className="flex gap-2">
              <dt className="text-[color:var(--pdf-muted)]">Issued</dt>
              <dd className="text-[color:var(--pdf-heading)]">Oct 1, 2026</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-[color:var(--pdf-muted)]">Due</dt>
              <dd className="text-[color:var(--pdf-heading)]">Oct 15, 2026</dd>
            </div>
          </dl>
        </section>

        <section className="space-y-1">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--pdf-muted)]">
            Bill to
          </h2>
          <address className="not-italic text-[color:var(--pdf-fg)]">
            <span className="font-medium text-[color:var(--pdf-heading)]">
              Acme Retail Inc
            </span>
            <br />
            Attn: Accounts Payable
          </address>
        </section>
      </div>

      <section className="mt-10">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[color:var(--pdf-border)]">
              <th
                scope="col"
                className="pb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--pdf-subtle)]"
              >
                Description
              </th>
              <th
                scope="col"
                className="pb-3 text-right text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--pdf-subtle)]"
              >
                Qty
              </th>
              <th
                scope="col"
                className="pb-3 text-right text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--pdf-subtle)]"
              >
                Unit
              </th>
              <th
                scope="col"
                className="pb-3 text-right text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--pdf-subtle)]"
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {LINE_ITEMS.map((item) => (
              <tr
                key={item.description}
                className="border-b border-[color:var(--pdf-border)] align-top"
              >
                <td className="py-4 pr-4">
                  <span className="block font-medium text-[color:var(--pdf-heading)]">
                    {item.description}
                  </span>
                  <span className="block text-[color:var(--pdf-muted)]">
                    {item.detail}
                  </span>
                </td>
                <td className="py-4 text-right tabular-nums text-[color:var(--pdf-fg)]">
                  {number.format(item.qty)}
                </td>
                <td className="py-4 text-right tabular-nums text-[color:var(--pdf-muted)]">
                  {currency.format(item.unit)}
                </td>
                <td className="py-4 text-right font-medium tabular-nums text-[color:var(--pdf-heading)]">
                  {currency.format(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-6 flex justify-end">
        <dl className="w-full max-w-[280px] space-y-2">
          <div className="flex items-baseline justify-between gap-6">
            <dt className="text-[color:var(--pdf-muted)]">Subtotal</dt>
            <dd className="tabular-nums text-[color:var(--pdf-fg)]">
              {currency.format(SUBTOTAL)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-6">
            <dt className="text-[color:var(--pdf-muted)]">Tax (8.5%)</dt>
            <dd className="tabular-nums text-[color:var(--pdf-fg)]">
              {currency.format(TAX)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-6 border-t border-[color:var(--pdf-border)] pt-3">
            <dt className="font-medium text-[color:var(--pdf-heading)]">Total</dt>
            <dd className="text-lg font-semibold tabular-nums text-[color:var(--pdf-heading)]">
              {currency.format(TOTAL)}
            </dd>
          </div>
        </dl>
      </section>

      <footer className="mt-auto space-y-1 border-t border-[color:var(--pdf-border)] pt-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--pdf-muted)]">
          Payment terms
        </p>
        <p className="text-[color:var(--pdf-muted)]">
          Net 15 — payment is due within 15 days of the invoice date. Please
          reference{" "}
          <span className="tabular-nums text-[color:var(--pdf-fg)]">
            INV-2026-0842
          </span>{" "}
          with your remittance.
        </p>
        <p className="pt-2 text-[color:var(--pdf-accent)]">
          Thank you for your business.
        </p>
      </footer>
    </article>
  );
}
