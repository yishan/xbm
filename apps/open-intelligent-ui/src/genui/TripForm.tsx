import { useState } from "react"
import { Check, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import type { TripFormProps } from "./types"

export function TripForm({ destination, nights, travellers, budgetCny, onSubmit }: TripFormProps) {
  const [dest, setDest] = useState(destination)
  const [nightCount, setNightCount] = useState(nights)
  const [people, setPeople] = useState(travellers)
  const [budget, setBudget] = useState(budgetCny)
  const [confirmed, setConfirmed] = useState(false)

  const perNight = Math.round(budget / Math.max(nightCount, 1))
  const perPersonNight = Math.round(perNight / Math.max(people, 1))
  const canSubmit = dest.trim().length > 0

  const summary = `前往${dest.trim()}，${nightCount}晚，${people}人，总预算 ¥${budget.toLocaleString("zh-CN")}`

  function handleSubmit() {
    if (!canSubmit) return
    setConfirmed(true)
    onSubmit?.(summary)
  }

  if (confirmed) {
    return (
      <Card className="w-full rounded-xl border shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 px-5 py-8 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-muted text-foreground">
            <Check className="size-5" />
          </span>
          <p className="text-sm font-medium text-foreground">行程已确认</p>
          <p className="text-sm text-muted-foreground">{summary}</p>
          <Button
            variant="outline"
            size="sm"
            data-testid="trip-edit"
            className="mt-1 transition-colors"
            onClick={() => setConfirmed(false)}
          >
            返回修改
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full rounded-xl border shadow-sm">
      <CardHeader className="px-5 pb-3 pt-5">
        <CardTitle className="text-base">行程定制</CardTitle>
        <p className="text-xs text-muted-foreground">调整下方选项，生成专属行程（示例数据）</p>
      </CardHeader>
      <CardContent className="space-y-5 px-5 pb-5">
        <div className="space-y-1.5">
          <label htmlFor="trip-destination" className="text-xs font-medium text-muted-foreground">
            目的地
          </label>
          <Input
            id="trip-destination"
            data-testid="trip-destination"
            className="h-9 text-sm"
            placeholder="想去哪里？"
            value={dest}
            onChange={(event) => setDest(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">行程天数</span>
            <span className="text-xs font-medium text-foreground tabular-nums">{nightCount} 晚</span>
          </div>
          <Slider
            data-testid="trip-nights"
            min={1}
            max={14}
            step={1}
            value={[nightCount]}
            onValueChange={(value) => setNightCount(value[0] ?? nightCount)}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-muted-foreground">出行人数</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-lg transition-colors"
              data-testid="trip-travellers-dec"
              aria-label="减少人数"
              disabled={people <= 1}
              onClick={() => setPeople((current) => Math.max(1, current - 1))}
            >
              <Minus className="size-4" />
            </Button>
            <span className="min-w-10 text-center text-sm font-medium tabular-nums" data-testid="trip-travellers-value">
              {people} 人
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-lg transition-colors"
              data-testid="trip-travellers-inc"
              aria-label="增加人数"
              disabled={people >= 20}
              onClick={() => setPeople((current) => Math.min(20, current + 1))}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">总预算</span>
            <span className="text-xs font-medium text-foreground tabular-nums">
              ¥{budget.toLocaleString("zh-CN")}
            </span>
          </div>
          <Slider
            data-testid="trip-budget"
            min={1000}
            max={50000}
            step={500}
            value={[budget]}
            onValueChange={(value) => setBudget(value[0] ?? budget)}
          />
        </div>

        <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          每晚约 <span className="font-medium text-foreground tabular-nums">¥{perNight.toLocaleString("zh-CN")}</span>
          <span className="mx-1">·</span>
          人均每晚 <span className="tabular-nums">¥{perPersonNight.toLocaleString("zh-CN")}</span>
        </div>

        <Button
          className="w-full transition-colors"
          data-testid="trip-submit"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          生成行程
        </Button>
      </CardContent>
    </Card>
  )
}
