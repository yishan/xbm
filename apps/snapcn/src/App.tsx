import React, { useEffect, useState } from "react"
import { AbsoluteFill, Sequence } from "remotion"
import { Player } from "@remotion/player"

import { TextReveal } from "@/components/snap-cn/text-reveal"
import { AnswerStream } from "@/components/snap-cn/answer-stream"
import {
  TerminalSimulator,
  type TerminalLine,
} from "@/components/snap-cn/terminal-simulator"
import { PhoneFrame } from "@/components/snap-cn/phone-frame"
import { KaraokeCaptions } from "@/components/snap-cn/karaoke-captions"

type Mode = "light" | "dark"

const FPS = 30
const WIDTH = 1280
const HEIGHT = 720

const BG: Record<Mode, string> = {
  light: "#ffffff",
  dark: "#0a0a0a",
}

/* -------------------------------------------------------------------------- */
/*  Theme                                                                     */
/* -------------------------------------------------------------------------- */

function useTheme() {
  const [mode, setMode] = useState<Mode>(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
  )
  const [manual, setManual] = useState(false)

  // Follow the OS until the user explicitly picks a side.
  useEffect(() => {
    if (manual) return
    const query = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = (event: MediaQueryListEvent) => {
      setMode(event.matches ? "dark" : "light")
    }
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [manual])

  // Reflect the theme on <html> so Tailwind's dark: variant kicks in.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark")
    document.documentElement.style.colorScheme = mode
  }, [mode])

  const toggle = () => {
    setManual(true)
    setMode((current) => (current === "dark" ? "light" : "dark"))
  }

  return { mode, toggle }
}

/* -------------------------------------------------------------------------- */
/*  Icons                                                                     */
/* -------------------------------------------------------------------------- */

function SunIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sample data (示例数据)                                                     */
/* -------------------------------------------------------------------------- */

const FEEDBACK_CARDS = [
  {
    title: "上手速度",
    body: "新用户前三天流失最多，引导流程值得再砍掉两步。",
  },
  {
    title: "搜索体验",
    body: "42% 的反馈提到找不到历史笔记，建议补齐全文检索。",
  },
  {
    title: "移动端同步",
    body: "同步偶发延迟，离线编辑后容易产生冲突副本。",
  },
]

const ANSWER_CARDS = [
  {
    title: "开场钩子",
    body: "3 秒内抛出用户痛点（示例数据）。",
  },
  {
    title: "产品时刻",
    body: "用一个真实操作展示核心价值。",
  },
  {
    title: "行动号召",
    body: "结尾只留一个下一步。",
  },
]

const TERMINAL_LINES: TerminalLine[] = [
  {
    type: "command",
    text: "bun x shadcn add @snapcn/terminal-simulator",
  },
  {
    type: "log",
    text: "Checking registry https://snapcn.dev/r/terminal-simulator.json",
  },
  {
    type: "log",
    text: "Writing components/snap-cn/terminal-simulator.tsx",
  },
  {
    type: "success",
    text: "Done. 1 component added in 1.2s",
  },
]

/* -------------------------------------------------------------------------- */
/*  Compositions                                                              */
/* -------------------------------------------------------------------------- */

const LaunchScene: React.FC<{ mode: Mode }> = ({ mode }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG[mode] }}>
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill
          style={{
            backgroundColor: BG[mode],
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TextReveal mode={mode} text="Meet Northwind Notes" fontSize={96} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={90} durationInFrames={120}>
        <AbsoluteFill style={{ backgroundColor: BG[mode] }}>
          <AnswerStream
            mode={mode}
            question="帮我总结本周的用户反馈"
            answer={"正在整理示例反馈…\n共 42 条示例反馈，归纳为 3 个高频主题。"}
            headline="本周反馈概览：3 个高频问题，2 个可以马上修"
            cards={FEEDBACK_CARDS}
          />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={210} durationInFrames={90}>
        <AbsoluteFill
          style={{
            backgroundColor: BG[mode],
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <KaraokeCaptions
            mode={mode}
            text="Ship demos as code, not screen recordings"
            emphasize="code"
          />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  )
}

const TextRevealDemo: React.FC<{ mode: Mode }> = ({ mode }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG[mode],
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <TextReveal
        mode={mode}
        text="Title reveals that feel like a keynote"
        fontSize={64}
      />
    </AbsoluteFill>
  )
}

const AnswerStreamDemo: React.FC<{ mode: Mode }> = ({ mode }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG[mode] }}>
      <AnswerStream
        mode={mode}
        question="How should I open a 30-second launch demo?"
        answer="Drafting a storyboard (示例数据)…\nHook first, then the product moment, then one clear call to action."
        headline="A three-beat launch clip (示例数据):"
        cards={ANSWER_CARDS}
      />
    </AbsoluteFill>
  )
}

const TerminalDemo: React.FC<{ mode: Mode }> = ({ mode }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG[mode],
        alignItems: "center",
        justifyContent: "center",
        padding: 56,
      }}
    >
      <TerminalSimulator
        mode={mode}
        lines={TERMINAL_LINES}
        command={{
          managers: ["bun", "npm", "pnpm"],
          text: "bun x shadcn add @snapcn/text-reveal",
        }}
      />
    </AbsoluteFill>
  )
}

const NotesScreen: React.FC<{ mode: Mode }> = ({ mode }) => {
  const dark = mode === "dark"
  const rows = [
    "上手速度：引导流程可以更短",
    "搜索体验：需要全文检索",
    "移动端：同步偶发延迟",
  ]

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        padding: 26,
        fontFamily:
          'ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif',
        background: dark ? "#111113" : "#ffffff",
        color: dark ? "#f4f4f5" : "#18181b",
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: "0.14em",
          opacity: 0.5,
        }}
      >
        NORTHWIND NOTES
      </div>
      <div style={{ fontSize: 25, fontWeight: 600, marginTop: 10 }}>
        本周用户反馈
      </div>
      <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
        {rows.map((row) => (
          <div
            key={row}
            style={{
              fontSize: 14,
              lineHeight: 1.4,
              padding: "12px 14px",
              borderRadius: 12,
              background: dark ? "#1c1c20" : "#f4f4f5",
            }}
          >
            {row}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, fontSize: 11, opacity: 0.45 }}>
        示例数据 · 仅用于演示
      </div>
    </div>
  )
}

const PhoneDemo: React.FC<{ mode: Mode }> = ({ mode }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG[mode],
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <PhoneFrame mode={mode} variant="tilt" tiltAngle={-8} scale={0.92}>
        <NotesScreen mode={mode} />
      </PhoneFrame>
    </AbsoluteFill>
  )
}

const KaraokeDemo: React.FC<{ mode: Mode }> = ({ mode }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG[mode],
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <KaraokeCaptions
        mode={mode}
        text="Captions synced word by word"
        emphasize="word"
      />
    </AbsoluteFill>
  )
}

/* -------------------------------------------------------------------------- */
/*  Gallery registry                                                          */
/* -------------------------------------------------------------------------- */

type Demo = {
  id: string
  title: string
  description: string
  durationInFrames: number
  composition: React.FC<{ mode: Mode }>
}

const GALLERY: Demo[] = [
  {
    id: "text-reveal",
    title: "TextReveal",
    description: "逐词推进的标题动画，适合开场关键词。",
    durationInFrames: 120,
    composition: TextRevealDemo,
  },
  {
    id: "answer-stream",
    title: "AnswerStream",
    description: "AI 回答流：提问、打字、卡片结论一气呵成。",
    durationInFrames: 150,
    composition: AnswerStreamDemo,
  },
  {
    id: "terminal-simulator",
    title: "TerminalSimulator",
    description: "命令行安装过程模拟，支持多包管理器切换。",
    durationInFrames: 180,
    composition: TerminalDemo,
  },
  {
    id: "phone-frame",
    title: "PhoneFrame",
    description: "带倾斜与浮动效果的手机外壳，可放任意界面。",
    durationInFrames: 150,
    composition: PhoneDemo,
  },
  {
    id: "karaoke-captions",
    title: "KaraokeCaptions",
    description: "逐词高亮的卡拉 OK 字幕，强调指定词。",
    durationInFrames: 120,
    composition: KaraokeDemo,
  },
]

/* -------------------------------------------------------------------------- */
/*  App                                                                       */
/* -------------------------------------------------------------------------- */

export default function App() {
  const { mode, toggle } = useTheme()
  const dark = mode === "dark"

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-neutral-50/85 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/85">
        <div className="mx-auto flex max-w-6xl items-start justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              snapcn 产品演示组件
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-neutral-500 sm:text-sm dark:text-neutral-400">
              从 snapcn 注册表复制来的 Remotion 组件，用于产品演示视频，在浏览器里由 Remotion
              Player 直接播放。
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full border border-neutral-200 px-2.5 py-1 text-[11px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              示例数据
            </span>
            <button
              type="button"
              onClick={toggle}
              aria-label={dark ? "切换到浅色模式" : "切换到深色模式"}
              aria-pressed={dark}
              className="inline-flex h-8 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              {dark ? <MoonIcon /> : <SunIcon />}
              <span>{dark ? "深色" : "浅色"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Section 1 ---------------------------------------------------------- */}
        <section>
          <h2 className="text-base font-semibold tracking-tight sm:text-lg">
            发布短片
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            10 秒组合示例：标题揭示 → AI 回答流 → 关键词字幕，依次衔接。
          </p>

          <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <Player
              component={LaunchScene}
              inputProps={{ mode }}
              durationInFrames={300}
              compositionWidth={WIDTH}
              compositionHeight={HEIGHT}
              fps={FPS}
              controls
              loop
              initialFrame={200}
              acknowledgeRemotionLicense
              style={{ width: "100%" }}
            />
          </div>
        </section>

        {/* Section 2 ---------------------------------------------------------- */}
        <section className="mt-12">
          <h2 className="text-base font-semibold tracking-tight sm:text-lg">
            组件画廊
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            每个组件单独预览，全部使用示例数据，跟随页面主题切换。
          </p>

          <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {GALLERY.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="mb-3">
                  <h3 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {item.description}
                  </p>
                </div>

                <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <Player
                    component={item.composition}
                    inputProps={{ mode }}
                    durationInFrames={item.durationInFrames}
                    compositionWidth={WIDTH}
                    compositionHeight={HEIGHT}
                    fps={FPS}
                    controls
                    loop
                    autoPlay
                    initiallyMuted
                    acknowledgeRemotionLicense
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-16 pt-6 text-xs text-neutral-500 sm:px-6 dark:text-neutral-400">
        <p className="sm:pl-36">
          Components © Shadcn Labs /{" "}
          <a
            href="https://github.com/shadcn-labs/snapcn"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            snapcn
          </a>{" "}
          (MIT) · Remotion Player (free, in-browser preview only) ·{" "}
          <a
            href="https://snapcn.dev"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            snapcn.dev
          </a>
        </p>
      </footer>
    </div>
  )
}
