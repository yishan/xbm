import { useRef } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { Menu } from "@base-ui/react/menu"
import { Popover } from "@base-ui/react/popover"
import { Select } from "@base-ui/react/select"
import { Slider } from "@base-ui/react/slider"
import { Tabs } from "@base-ui/react/tabs"
import { Toast } from "@base-ui/react/toast"
import {
  Archive,
  Check,
  ChevronDown,
  ChevronsUpDown,
  Copy,
  FolderInput,
  Pencil,
  X,
} from "lucide-react"

const TOAST_TITLES = ["已保存 Saved", "Synced 3 示例 files", "Copied link"]

const FRUITS = [
  { value: "apple", label: "苹果 Apple" },
  { value: "persimmon", label: "柿子 Persimmon" },
  { value: "lychee", label: "荔枝 Lychee" },
  { value: "bayberry", label: "杨梅 Bayberry" },
]

function CardHead({ name }: { name: string }) {
  return (
    <div className="lab-card-head">
      <span className="lab-card-name">{name}</span>
      <span className="lab-sample">示例数据</span>
    </div>
  )
}

function ToastCard() {
  const toastManager = Toast.useToastManager()
  const next = useRef(0)

  const show = () => {
    const title = TOAST_TITLES[next.current % TOAST_TITLES.length]
    next.current += 1
    toastManager.add({ title, description: "示例数据" })
  }

  return (
    <article className="lab-card">
      <CardHead name="Toast" />
      <div className="lab-stage">
        <button type="button" className="lab-btn" onClick={show}>
          Show toast
        </button>
      </div>
    </article>
  )
}

export function Board() {
  return (
    <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-5 p-6 md:grid-cols-2 xl:grid-cols-3">
      <article className="lab-card">
        <CardHead name="Popover" />
        <div className="lab-stage">
          <Popover.Root>
            <Popover.Trigger data-part="Popover.Trigger" className="lab-btn">
              Open popover
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner data-part="Popover.Positioner" sideOffset={8}>
                <Popover.Popup
                  data-part="Popover.Popup"
                  className="lab-popup"
                  style={{ width: 260, padding: 14 }}
                >
                  <Popover.Title
                    data-part="Popover.Title"
                    style={{ fontSize: 14, fontWeight: 600 }}
                  >
                    Rollout 示例
                  </Popover.Title>
                  <Popover.Description
                    data-part="Popover.Description"
                    style={{ marginTop: 4, fontSize: 13, color: "var(--muted-foreground)" }}
                  >
                    Ship to 25% of 示例 workspace.
                  </Popover.Description>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </article>

      <article className="lab-card">
        <CardHead name="Menu" />
        <div className="lab-stage">
          <Menu.Root>
            <Menu.Trigger data-part="Menu.Trigger" className="lab-btn">
              Actions
              <ChevronDown size={14} />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner data-part="Menu.Positioner" sideOffset={8}>
                <Menu.Popup data-part="Menu.Popup" className="lab-popup" style={{ minWidth: 180 }}>
                  <Menu.Item data-part="Menu.Item" className="lab-item">
                    <Copy size={15} />
                    Duplicate
                  </Menu.Item>
                  <Menu.Item data-part="Menu.Item" className="lab-item">
                    <Pencil size={15} />
                    Rename
                  </Menu.Item>
                  <Menu.Item data-part="Menu.Item" className="lab-item">
                    <FolderInput size={15} />
                    Move to…
                  </Menu.Item>
                  <Menu.Separator
                    data-part="Menu.Separator"
                    style={{ height: 1, margin: "4px 0", background: "var(--border)" }}
                  />
                  <Menu.Item data-part="Menu.Item" className="lab-item">
                    <Archive size={15} />
                    Archive
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
      </article>

      <article className="lab-card">
        <CardHead name="Select" />
        <div className="lab-stage">
          <Select.Root items={FRUITS} defaultValue="lychee">
            <Select.Trigger
              data-part="Select.Trigger"
              className="lab-btn"
              style={{ minWidth: 200, justifyContent: "space-between" }}
            >
              <Select.Value data-part="Select.Value" />
              <Select.Icon data-part="Select.Icon">
                <ChevronsUpDown size={14} />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner
                data-part="Select.Positioner"
                sideOffset={6}
                alignItemWithTrigger={false}
              >
                <Select.Popup
                  data-part="Select.Popup"
                  className="lab-popup"
                  style={{ minWidth: "var(--anchor-width)" }}
                >
                  <Select.List data-part="Select.List">
                    {FRUITS.map((fruit) => (
                      <Select.Item
                        key={fruit.value}
                        value={fruit.value}
                        data-part="Select.Item"
                        className="lab-item"
                      >
                        <Select.ItemIndicator data-part="Select.ItemIndicator">
                          <Check size={14} />
                        </Select.ItemIndicator>
                        <Select.ItemText data-part="Select.ItemText">
                          {fruit.label}
                        </Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </div>
      </article>

      <article className="lab-card">
        <CardHead name="Dialog" />
        <div className="lab-stage">
          <Dialog.Root>
            <Dialog.Trigger data-part="Dialog.Trigger" className="lab-btn">
              Open dialog
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop data-part="Dialog.Backdrop" className="lab-backdrop" />
              <Dialog.Popup data-part="Dialog.Popup" className="lab-dialog">
                <Dialog.Title
                  data-part="Dialog.Title"
                  style={{ fontSize: 17, fontWeight: 600 }}
                >
                  Publish 示例 page?
                </Dialog.Title>
                <Dialog.Description
                  data-part="Dialog.Description"
                  style={{ marginTop: 6, fontSize: 14, color: "var(--muted-foreground)" }}
                >
                  It goes live at li.yishan.app.
                </Dialog.Description>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                    marginTop: 20,
                  }}
                >
                  <Dialog.Close data-part="Dialog.Close" className="lab-btn">
                    Cancel
                  </Dialog.Close>
                  <Dialog.Close
                    data-part="Dialog.Close"
                    className="lab-btn lab-btn-accent"
                  >
                    Publish
                  </Dialog.Close>
                </div>
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </article>

      <ToastCard />

      <article className="lab-card">
        <CardHead name="Tabs" />
        <div className="lab-stage">
          <Tabs.Root defaultValue="overview">
            <Tabs.List data-part="Tabs.List" className="lab-tabs-list">
              <Tabs.Tab data-part="Tabs.Tab" value="overview" className="lab-tab">
                Overview
              </Tabs.Tab>
              <Tabs.Tab data-part="Tabs.Tab" value="motion" className="lab-tab">
                Motion
              </Tabs.Tab>
              <Tabs.Tab data-part="Tabs.Tab" value="surface" className="lab-tab">
                Surface
              </Tabs.Tab>
              <Tabs.Indicator data-part="Tabs.Indicator" className="lab-tab-indicator" />
            </Tabs.List>
            <Tabs.Panel
              data-part="Tabs.Panel"
              value="overview"
              style={{ marginTop: 12, fontSize: 14, color: "var(--muted-foreground)" }}
            >
              Overview 示例：一个简短的概览句子。
            </Tabs.Panel>
            <Tabs.Panel
              data-part="Tabs.Panel"
              value="motion"
              style={{ marginTop: 12, fontSize: 14, color: "var(--muted-foreground)" }}
            >
              Motion 示例：duration、easing 与 scale。
            </Tabs.Panel>
            <Tabs.Panel
              data-part="Tabs.Panel"
              value="surface"
              style={{ marginTop: 12, fontSize: 14, color: "var(--muted-foreground)" }}
            >
              Surface 示例：radius、shadow 与 hue。
            </Tabs.Panel>
          </Tabs.Root>
        </div>
      </article>

      <article className="lab-card md:col-span-2 xl:col-span-3">
        <CardHead name="Slider" />
        <div className="lab-stage">
          <div style={{ width: "100%", maxWidth: 520 }}>
            <Slider.Root
              data-part="Slider.Root"
              className="lab-slider"
              defaultValue={[20, 70]}
              min={0}
              max={100}
              step={1}
            >
              <Slider.Value
                data-part="Slider.Value"
                className="lab-num"
                style={{ display: "block", marginBottom: 10, fontSize: 13 }}
              />
              <Slider.Control data-part="Slider.Control" className="lab-slider-control">
                <Slider.Track data-part="Slider.Track" className="lab-slider-track">
                  <Slider.Indicator
                    data-part="Slider.Indicator"
                    className="lab-slider-indicator"
                  />
                  <Slider.Thumb
                    data-part="Slider.Thumb"
                    className="lab-slider-thumb"
                    aria-label="Minimum"
                  />
                  <Slider.Thumb
                    data-part="Slider.Thumb"
                    className="lab-slider-thumb"
                    aria-label="Maximum"
                  />
                </Slider.Track>
              </Slider.Control>
            </Slider.Root>
          </div>
        </div>
      </article>
    </div>
  )
}

export function ToastList() {
  const toastManager = Toast.useToastManager()

  return (
    <Toast.Portal>
      <Toast.Viewport className="lab-toast-viewport">
        {toastManager.toasts.map((toast) => (
          <Toast.Root
            key={toast.id}
            toast={toast}
            data-part="Toast.Root"
            className="lab-toast"
          >
            <Toast.Title
              data-part="Toast.Title"
              style={{ fontSize: 13, fontWeight: 600 }}
            >
              {toast.title}
            </Toast.Title>
            <Toast.Description
              data-part="Toast.Description"
              style={{ marginTop: 2, fontSize: 12, color: "var(--muted-foreground)" }}
            >
              {toast.description}
            </Toast.Description>
            <Toast.Close
              data-part="Toast.Close"
              aria-label="Dismiss"
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                padding: 2,
                border: 0,
                borderRadius: 4,
                background: "none",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              <X size={14} />
            </Toast.Close>
          </Toast.Root>
        ))}
      </Toast.Viewport>
    </Toast.Portal>
  )
}
