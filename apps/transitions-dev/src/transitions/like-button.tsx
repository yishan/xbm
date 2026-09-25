import { useState } from "react"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTrigger } from "@/lib/motion"
import type { DemoProps } from "./types"
import "./like-button.css"

const COLORS = ["#f43f5e", "#fb7185", "#f59e0b", "#a855f7", "#38bdf8"]
const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  a: `${i * 36 + (i % 2) * 12}deg`,
  d: `${i % 2 ? 26 : 36}px`,
  c: COLORS[i % COLORS.length],
}))

export function LikeButton({ trigger }: DemoProps) {
  const [liked, setLiked] = useState(false)
  const [burst, setBurst] = useState(0)

  const toggle = () => {
    if (!liked) setBurst((b) => b + 1)
    setLiked(!liked)
  }

  useTrigger(trigger, toggle)

  return (
    <button
      onClick={toggle}
      aria-pressed={liked}
      className={cn(
        "flex items-center gap-2 rounded-full border bg-card py-2 pr-4 pl-3 text-sm font-medium shadow-sm transition-colors hover:bg-muted",
        liked && "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
      )}
    >
      <span className="t-like size-5 text-rose-500" data-liked={liked}>
        <Heart
          className={cn("t-like-heart size-5", liked ? "fill-current" : "text-muted-foreground")}
          aria-hidden
        />
        {liked && burst > 0 && (
          <span key={burst} className="contents" aria-hidden>
            <span className="t-like-ring" />
            {PARTICLES.map((p, i) => (
              <span
                key={i}
                className="t-like-particle"
                style={{ "--a": p.a, "--d": p.d, "--c": p.c } as React.CSSProperties}
              />
            ))}
          </span>
        )}
      </span>
      <span className="tabular-nums">{liked ? 129 : 128}</span>
    </button>
  )
}

export const likeButtonJsx = `<button aria-pressed={liked} onClick={toggle}>
  <span className="t-like" data-liked={liked}>
    <HeartIcon className="t-like-heart" aria-hidden />
    {liked && (
      <span key={burstId} aria-hidden>
        <span className="t-like-ring" />
        {particles.map((p, i) => (
          <span key={i} className="t-like-particle"
            style={{ "--a": p.angle, "--d": p.distance, "--c": p.color }} />
        ))}
      </span>
    )}
  </span>
  {count}
</button>`
