import { useState } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { PlanCompareProps } from "./types"

type Billing = "monthly" | "yearly"

export function PlanCompare({ plans, onSelect }: PlanCompareProps) {
  const [billing, setBilling] = useState<Billing>("monthly")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleSelect = (id: string, name: string) => {
    setSelectedId(id)
    onSelect?.(name)
  }

  return (
    <div className="w-full max-w-[520px] text-sm">
      <div className="mb-3 inline-flex rounded-lg border border-border bg-muted p-0.5">
        <button
          type="button"
          data-testid="billing-monthly"
          onClick={() => setBilling("monthly")}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
            billing === "monthly"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          按月
        </button>
        <button
          type="button"
          data-testid="billing-yearly"
          onClick={() => setBilling("yearly")}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
            billing === "yearly"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          按年
        </button>
      </div>

      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
        {plans.map((plan) => {
          const yearly = billing === "yearly"
          const selected = plan.id === selectedId
          const price = yearly ? plan.priceCny * 10 : plan.priceCny

          return (
            <div
              key={plan.id}
              data-testid={`plan-card-${plan.id}`}
              className={cn(
                "relative flex flex-col rounded-xl border p-4 transition-colors",
                selected
                  ? "border-foreground/60 ring-1 ring-foreground/30"
                  : plan.highlight
                    ? "border-foreground/40"
                    : "border-border"
              )}
            >
              {plan.highlight ? (
                <Badge className="absolute right-3 -top-2">推荐</Badge>
              ) : null}

              <div className="font-medium text-foreground">{plan.name}</div>

              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-semibold tracking-tight text-foreground">
                  ¥{price}
                </span>
                <span className="text-xs text-muted-foreground">
                  /{yearly ? "年" : "月"}
                </span>
              </div>

              <div className="mt-1 h-4 text-xs text-muted-foreground">
                {yearly ? "省 2 个月" : ""}
              </div>

              <ul className="mt-3 flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-muted-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                type="button"
                size="sm"
                variant={selected ? "default" : "outline"}
                data-testid={`plan-select-${plan.id}`}
                aria-pressed={selected}
                className="mt-4 w-full transition-colors"
                onClick={() => handleSelect(plan.id, plan.name)}
              >
                {selected ? "已选择" : "选择"}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
