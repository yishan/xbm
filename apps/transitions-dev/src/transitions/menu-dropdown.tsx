import { useEffect, useRef, useState } from "react"
import { ArrowDownWideNarrow, ChevronDown, Copy, MoreHorizontal, Pencil, Share2, Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTimeouts, useTrigger } from "@/lib/motion"
import type { DemoProps } from "./types"
import "./menu-dropdown.css"

type State = "closed" | "open" | "closing"
type Side = "left" | "right"

const ITEMS: Record<Side, { icon: typeof Copy; label: string; danger?: boolean }[]> = {
  left: [
    { icon: Star, label: "Most popular" },
    { icon: ArrowDownWideNarrow, label: "Newest first" },
    { icon: Pencil, label: "Recently edited" },
  ],
  right: [
    { icon: Copy, label: "Duplicate" },
    { icon: Share2, label: "Share" },
    { icon: Trash2, label: "Delete", danger: true },
  ],
}

export function MenuDropdown({ trigger }: DemoProps) {
  const [menus, setMenus] = useState<Record<Side, State>>({ left: "closed", right: "closed" })
  const rootRef = useRef<HTMLDivElement>(null)
  const timers = useTimeouts()

  const set = (side: Side, open: boolean) =>
    setMenus((m) => {
      if (open) return { ...m, [side]: "open" }
      return m[side] === "open" ? { ...m, [side]: "closing" } : m
    })
  const toggle = (side: Side) => set(side, menus[side] !== "open")

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        set("left", false)
        set("right", false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        set("left", false)
        set("right", false)
      }
    }
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  // Replay: open the top-left menu, then the bottom-right one.
  useTrigger(trigger, () => {
    timers.clear()
    set("right", false)
    set("left", true)
    timers.set(() => set("left", false), 1100)
    timers.set(() => set("right", true), 1350)
    timers.set(() => set("right", false), 2500)
  })

  const menu = (side: Side) =>
    menus[side] !== "closed" && (
      <div
        role="menu"
        data-state={menus[side]}
        onAnimationEnd={() =>
          menus[side] === "closing" && setMenus((m) => ({ ...m, [side]: "closed" }))
        }
        style={{ "--origin": side === "left" ? "top left" : "bottom right" } as React.CSSProperties}
        className={cn(
          "t-menu absolute z-10 w-44 rounded-xl border bg-popover p-1 text-sm shadow-lg shadow-black/5",
          side === "left" ? "top-full left-0 mt-1.5" : "right-0 bottom-full mb-1.5",
        )}
      >
        {ITEMS[side].map(({ icon: Icon, label, danger }) => (
          <button
            key={label}
            role="menuitem"
            onClick={() => set(side, false)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-muted",
              danger && "text-destructive",
            )}
          >
            <Icon className="size-3.5 opacity-70" />
            {label}
          </button>
        ))}
      </div>
    )

  return (
    <div ref={rootRef} className="flex h-full w-full flex-col justify-between p-4">
      <div className="relative self-start">
        <Button variant="outline" size="sm" aria-haspopup="menu" aria-expanded={menus.left === "open"} onClick={() => toggle("left")}>
          Sort <ChevronDown className="size-3.5" />
        </Button>
        {menu("left")}
      </div>
      <div className="relative self-end">
        <Button variant="outline" size="icon-sm" aria-label="More actions" aria-haspopup="menu" aria-expanded={menus.right === "open"} onClick={() => toggle("right")}>
          <MoreHorizontal />
        </Button>
        {menu("right")}
      </div>
    </div>
  )
}

export const menuDropdownJsx = `// --origin matches the corner the menu is anchored to
{state !== "closed" && (
  <div
    role="menu"
    className="t-menu"
    data-state={state}
    style={{ "--origin": placement === "bottom-start" ? "top left" : "bottom right" }}
    onAnimationEnd={() => state === "closing" && setState("closed")}
  >
    {items}
  </div>
)}`
