import { useEffect } from "react"
import { ToastStack, useToastStack } from "@/blocks/toast-stack"

export function ToastStackDemo() {
  const { toasts, push, update, dismiss } = useToastStack()

  useEffect(() => {
    push({
      status: "info",
      title: "Todo archived",
      description: "You can restore it from settings",
    })
  }, [push])

  const runAgent = () => {
    const id = push({
      status: "loading",
      title: "Agent is browsing…",
    })
    window.setTimeout(() => {
      update(id, {
        status: "success",
        title: "Found 12 sources",
        description: "Primary and secondary research complete",
        action: {
          label: "Open",
          onClick: () => dismiss(id),
        },
      })
    }, 1600)
  }

  const runFail = () => {
    const id = push({
      status: "loading",
      title: "Agent is browsing…",
    })
    window.setTimeout(() => {
      update(id, {
        status: "error",
        title: "Rate limit hit",
        description: "Try again in a few seconds",
        action: {
          label: "Retry",
          onClick: () => dismiss(id),
        },
      })
    }, 1600)
  }

  return (
    <div className="flex min-h-[300px] w-full flex-col items-center gap-4 p-4">
      <div className="flex gap-2">
        <button
          type="button"
          data-testid="toast-push"
          onClick={runAgent}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Run agent task
        </button>
        <button
          type="button"
          data-testid="toast-fail"
          onClick={runFail}
          className="rounded-md bg-rose-100 px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-200"
        >
          Fail
        </button>
      </div>

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
