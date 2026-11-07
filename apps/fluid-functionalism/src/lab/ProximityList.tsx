import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react"
import { FluidHoverHighlight } from "@/components/fluid-hover-highlight"
import { useFluidHover } from "@/hooks/use-fluid-hover"
import { useShape } from "@/lib/shape-context"

const ROWS = ["龙眼", "荔枝", "柚子", "枇杷"] as const

type ProximityListProps = {
  radius: number
  reduced: boolean
}

export function ProximityList({ radius, reduced }: ProximityListProps) {
  const shape = useShape()
  const containerRef = useRef<HTMLDivElement>(null)
  const rows = useRef(new Map<number, HTMLButtonElement>())
  const hover = useFluidHover(containerRef, {
    nearest: true,
    axis: "y",
    gapClick: { maxDistance: radius },
  })
  const [picked, setPicked] = useState("龙眼")

  const registerItem = hover.registerItem
  const register = useCallback((index: number, element: HTMLButtonElement | null) => {
    registerItem(index, element)
    if (element) rows.current.set(index, element)
    else rows.current.delete(index)
  }, [registerItem])

  const onMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    hover.handlers.onMouseMove(event)
    const x = event.clientX
    const y = event.clientY
    const limit = radius
    requestAnimationFrame(() => {
      let closest: { index: number; distance: number } | null = null
      for (const [index, element] of rows.current) {
        const rect = element.getBoundingClientRect()
        const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
        const dx = Math.max(rect.left - x, 0, x - rect.right)
        const dy = Math.max(rect.top - y, 0, y - rect.bottom)
        const distance = inside ? 0 : Math.hypot(dx, dy)
        if (!closest || distance < closest.distance) closest = { index, distance }
      }
      if (!closest || closest.distance > limit) hover.setActiveIndex(null)
    })
  }

  return (
    <div className="block">
      <h2>列表</h2>
      <div
        ref={containerRef}
        className={`prox ${shape.container}`}
        onMouseEnter={hover.handlers.onMouseEnter}
        onMouseMove={reduced ? undefined : onMouseMove}
        onMouseLeave={hover.handlers.onMouseLeave}
        onClick={hover.handlers.onClick}
      >
        <FluidHoverHighlight hover={hover} transition={reduced ? false : undefined} className={shape.bg} />
        {ROWS.map((label, index) => (
          <Row
            key={label}
            index={index}
            label={label}
            pressed={picked === label}
            register={register}
            onPick={setPicked}
          />
        ))}
      </div>
      <p className="status" role="status">
        示例数据 · {picked}
      </p>
    </div>
  )
}

function Row({
  index,
  label,
  pressed,
  register,
  onPick,
}: {
  index: number
  label: string
  pressed: boolean
  register: (index: number, element: HTMLButtonElement | null) => void
  onPick: (label: string) => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    register(index, ref.current)
    return () => register(index, null)
  }, [index, register])
  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={pressed}
      onClick={() => onPick(label)}
    >
      {label}
    </button>
  )
}
