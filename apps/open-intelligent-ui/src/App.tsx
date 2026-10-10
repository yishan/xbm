import { useEffect, useRef, useState } from "react"
import { Bookmark, Send, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SCENARIOS, matchScenario } from "@/data/scenarios"
import { MetricChart } from "@/genui/MetricChart"
import { PlanCompare } from "@/genui/PlanCompare"
import { TaskBoard } from "@/genui/TaskBoard"
import { TripForm } from "@/genui/TripForm"
import { WeatherCard } from "@/genui/WeatherCard"
import type { ChatMessage, Scenario, UiCall } from "@/genui/types"
import { cn } from "@/lib/utils"

type AgentMessage = Extract<ChatMessage, { role: "agent" }>

type ToolEntry = { tool: string; component: string; description: string }

const TOOL_REGISTRY: ToolEntry[] = [
  { tool: "render_weather", component: "WeatherCard", description: "天气概览与未来预报" },
  { tool: "render_metric_chart", component: "MetricChart", description: "指标趋势与环比变化" },
  { tool: "render_trip_form", component: "TripForm", description: "行程规划与预算表单" },
  { tool: "render_task_board", component: "TaskBoard", description: "任务清单与负责人" },
  { tool: "render_plan_compare", component: "PlanCompare", description: "套餐对比与选择" },
]

const FALLBACK_THINKING = "正在匹配可用的设计系统组件…"
const FALLBACK_REPLY =
  "这是一个脚本化演示，没有接入真实模型。我能展示的有：上海天气、本周访问量、杭州周末行程、发布清单、套餐对比——点上面的场景，或直接输入关键词试试。"

const TRIP_THINKING = "正在整理行程方案…"
const TRIP_ACK = "好的，行程偏好已经记下，下一步可以补上交通和餐厅推荐。"

const PLAN_THINKING = "正在确认套餐信息…"

/** Renders the component that a scripted tool call points at. */
function ToolRenderer({
  call,
  onTripSubmit,
  onPlanSelect,
}: {
  call: UiCall
  onTripSubmit: (summary: string) => void
  onPlanSelect: (planName: string) => void
}) {
  switch (call.tool) {
    case "render_weather":
      return <WeatherCard {...call.props} />
    case "render_metric_chart":
      return <MetricChart {...call.props} />
    case "render_trip_form":
      return <TripForm {...call.props} onSubmit={onTripSubmit} />
    case "render_task_board":
      return <TaskBoard {...call.props} />
    case "render_plan_compare":
      return <PlanCompare {...call.props} onSelect={onPlanSelect} />
    default:
      return null
  }
}

function CallBlock({ call, open }: { call: UiCall; open: boolean }) {
  return (
    <details
      open={open}
      data-testid="call-block"
      className="overflow-hidden rounded-lg border border-neutral-200 bg-white"
    >
      <summary className="cursor-pointer select-none px-3 py-2 font-mono text-[11px] text-neutral-500 transition-colors hover:text-neutral-800">
        {call.tool}(…)
      </summary>
      <pre className="max-h-64 overflow-auto border-t border-neutral-200 px-3 py-2 text-[11px] leading-relaxed text-neutral-600">
        <code>{`${call.tool}(${JSON.stringify(call.props, null, 2)})`}</code>
      </pre>
    </details>
  )
}

function Dots() {
  return (
    <span className="flex shrink-0 items-center gap-1">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400"
          style={{ animationDelay: `${index * 160}ms` }}
        />
      ))}
    </span>
  )
}

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const [activeTool, setActiveTool] = useState<string | null>(null)

  const timersRef = useRef<Set<number>>(new Set())
  const idRef = useRef(0)
  const listRef = useRef<HTMLDivElement>(null)

  // Every timeout/interval the scripted agent schedules lives here so it can be
  // cleared on unmount.
  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((id) => window.clearTimeout(id))
      timers.clear()
    }
  }, [])

  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [messages])

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timersRef.current.delete(id)
      fn()
    }, ms)
    timersRef.current.add(id)
  }

  const nextId = () => {
    idRef.current += 1
    return `m${idRef.current}`
  }

  const updateAgent = (id: string, patch: Partial<Pick<AgentMessage, "text" | "status">>) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.role === "agent" && message.id === id ? { ...message, ...patch } : message,
      ),
    )
  }

  const streamText = (id: string, full: string, done: () => void) => {
    let index = 0
    const step = () => {
      index += 1
      updateAgent(id, { text: full.slice(0, index) })
      if (index < full.length) {
        later(step, 18)
      } else {
        done()
      }
    }
    later(step, 18)
  }

  // thinking (700ms) -> streaming (char by char) -> calling (500ms) -> done
  const playReply = (id: string, thinking: string, reply: string, call?: UiCall) => {
    setMessages((prev) => [
      ...prev,
      { id, role: "agent", text: thinking, call, status: "thinking" },
    ])

    later(() => {
      updateAgent(id, { text: "", status: "streaming" })
      streamText(id, reply, () => {
        if (!call) {
          updateAgent(id, { status: "done" })
          setBusy(false)
          return
        }
        updateAgent(id, { status: "calling" })
        setActiveTool(call.tool)
        later(() => {
          updateAgent(id, { status: "done" })
          setBusy(false)
        }, 500)
      })
    }, 700)
  }

  const submit = (raw: string) => {
    const text = raw.trim()
    if (!text || busy) return
    const scenario = matchScenario(text)
    setMessages((prev) => [...prev, { id: nextId(), role: "user", text }])
    setInput("")
    setBusy(true)
    if (scenario) {
      playReply(nextId(), scenario.thinking, scenario.text, scenario.call)
    } else {
      playReply(nextId(), FALLBACK_THINKING, FALLBACK_REPLY)
    }
  }

  const pickScenario = (scenario: Scenario) => {
    if (busy) return
    setMessages((prev) => [...prev, { id: nextId(), role: "user", text: scenario.chip }])
    setBusy(true)
    playReply(nextId(), scenario.thinking, scenario.text, scenario.call)
  }

  const handleTripSubmit = (summary: string) => {
    if (busy) return
    setMessages((prev) => [...prev, { id: nextId(), role: "user", text: summary }])
    setBusy(true)
    playReply(nextId(), TRIP_THINKING, TRIP_ACK)
  }

  const handlePlanSelect = (planName: string) => {
    if (busy) return
    setMessages((prev) => [...prev, { id: nextId(), role: "user", text: `我选「${planName}」` }])
    setBusy(true)
    playReply(nextId(), PLAN_THINKING, `好的，已按「${planName}」继续，需要我列出开通步骤吗？`)
  }

  const renderChip = (scenario: Scenario, testIdPrefix: string) => (
    <button
      key={scenario.id}
      type="button"
      data-testid={`${testIdPrefix}${scenario.id}`}
      onClick={() => pickScenario(scenario)}
      disabled={busy}
      className={cn(
        "rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-600",
        "transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900",
        "disabled:cursor-not-allowed disabled:opacity-50",
      )}
    >
      {scenario.chip}
    </button>
  )

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5">
          <div className="min-w-0">
            <h1 className="text-sm font-semibold tracking-tight text-neutral-900">Open Intelligent UI</h1>
            <p className="truncate text-xs text-neutral-500">智能体用你的设计系统组件来回答</p>
          </div>
          <Badge
            variant="outline"
            className="shrink-0 rounded-full border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700"
          >
            示例数据 · 无真实模型
          </Badge>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 items-start justify-center gap-8 px-4 py-6">
        <section className="w-full max-w-[640px]">
          <div className="flex h-[min(70vh,700px)] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-neutral-900">试试这些场景</p>
                    <p className="text-xs text-neutral-500">智能体会调用注册表里的组件来回答</p>
                  </div>
                  <div className="flex max-w-[440px] flex-wrap justify-center gap-2">
                    {SCENARIOS.map((scenario) => renderChip(scenario, "chip-"))}
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  if (message.role === "user") {
                    return (
                      <div key={message.id} className="flex justify-end">
                        <div className="max-w-[85%] rounded-xl bg-neutral-900 px-3.5 py-2 text-sm leading-relaxed text-white">
                          {message.text}
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={message.id} className="flex justify-start">
                      <div className="w-full max-w-[92%] space-y-2.5 rounded-xl border border-neutral-200 bg-neutral-50/80 px-3.5 py-3 text-sm text-neutral-800">
                        {message.status === "thinking" ? (
                          <div className="flex items-center gap-2 text-neutral-500">
                            <Dots />
                            <span>{message.text}</span>
                          </div>
                        ) : (
                          <>
                            <p className="leading-relaxed whitespace-pre-wrap">
                              {message.text}
                              {message.status === "streaming" ? (
                                <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-neutral-400 align-middle" />
                              ) : null}
                            </p>

                            {message.call && message.status !== "streaming" ? (
                              <CallBlock call={message.call} open={message.status === "calling"} />
                            ) : null}

                            {message.call && message.status === "done" ? (
                              <ToolRenderer
                                call={message.call}
                                onTripSubmit={handleTripSubmit}
                                onPlanSelect={handlePlanSelect}
                              />
                            ) : null}

                            {message.call ? (
                              <p className="text-[11px] text-neutral-400">示例数据 · scripted reply</p>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="border-t border-neutral-200 bg-white px-3 pt-2 pb-3">
              <div className="flex flex-wrap gap-1.5 pb-2">
                {SCENARIOS.map((scenario) => renderChip(scenario, "chip-quick-"))}
              </div>
              <form
                className="flex items-center gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  submit(input)
                }}
              >
                <Input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="问点什么，比如“上海天气”"
                  disabled={busy}
                  data-testid="composer-input"
                  className="h-9 flex-1 rounded-xl"
                />
                <Button
                  type="submit"
                  disabled={busy || input.trim().length === 0}
                  data-testid="send"
                  className="h-9 gap-1.5 rounded-xl px-3"
                >
                  <Send className="h-3.5 w-3.5" />
                  发送
                </Button>
              </form>
            </div>
          </div>
        </section>

        <aside className="hidden w-[17rem] shrink-0 lg:block">
          <div className="sticky top-20 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-neutral-400" />
              <h2 className="text-sm font-semibold text-neutral-900">设计系统注册表</h2>
            </div>
            <ul className="space-y-2">
              {TOOL_REGISTRY.map((entry) => {
                const active = entry.tool === activeTool
                return (
                  <li
                    key={entry.tool}
                    data-testid={`registry-${entry.tool}`}
                    className={cn(
                      "rounded-xl border bg-white px-3 py-2.5 transition-colors",
                      active
                        ? "border-neutral-300 bg-neutral-900/[0.03] shadow-sm"
                        : "border-neutral-200",
                    )}
                  >
                    <p className="font-mono text-[11px] text-neutral-500">{entry.tool}</p>
                    <p className="text-sm font-medium text-neutral-900">{entry.component}</p>
                    <p className="text-xs text-neutral-500">{entry.description}</p>
                  </li>
                )
              })}
            </ul>
            <p className="text-[11px] leading-relaxed text-neutral-400">
              智能体只会调用注册表里的组件，参数全部来自示例数据。
            </p>
          </div>
        </aside>
      </main>

      <footer className="mt-auto border-t border-neutral-200 bg-white py-4">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 pl-[140px] text-xs text-neutral-500 sm:pl-4">
          <span>
            灵感来自{" "}
            <a
              href="https://github.com/CopilotKit/OpenIntelligentUI"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-neutral-700 underline-offset-2 hover:underline"
            >
              CopilotKit / OpenIntelligentUI
            </a>{" "}
            (MIT)
          </span>
          <a
            href="https://x.com/CopilotKit/status/2108555099241128416"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-neutral-700 underline-offset-2 hover:underline"
          >
            <Bookmark className="h-3.5 w-3.5" />
            推文
          </a>
        </div>
      </footer>
    </div>
  )
}
