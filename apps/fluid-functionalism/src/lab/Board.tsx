import { useEffect, useRef, useState } from "react"
import { Clock, Star, Users } from "lucide-react"
import { motion } from "motion/react"
import { ChatMessage } from "@/components/ui/chat-message"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownContent, DropdownMenu, DropdownTrigger } from "@/components/ui/dropdown"
import { MenuItem } from "@/components/ui/menu-item"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsItem, TabsPanel } from "@/components/ui/tabs"
import { ThinkingIndicator } from "@/components/ui/thinking-indicator"
import { Button } from "@/components/ui/button"
import { Button as RadixButton } from "@/components/ui/button-radix"
import { spring } from "@/lib/springs"
import { ProximityList } from "./ProximityList"

const FRUITS = [
  { value: "lychee", label: "荔枝" },
  { value: "longan", label: "龙眼" },
  { value: "pomelo", label: "柚子" },
] as const

const TABS = ["概览", "明细", "记录"] as const
const SCOPES = [
  { label: "最近", icon: Clock },
  { label: "收藏", icon: Star },
  { label: "共享", icon: Users },
] as const

type BoardProps = {
  proximity: number
  reduced: boolean
  nudge: number
}

export function Board({ proximity, reduced, nudge }: BoardProps) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState(0)
  const [fruit, setFruit] = useState("lychee")
  const [notify, setNotify] = useState(true)
  const [strength, setStrength] = useState(40)
  const [scope, setScope] = useState(0)
  const [messages, setMessages] = useState<Array<{ id: number; from: "user" | "assistant"; text: string; fresh: boolean }>>([
    { id: 1, from: "assistant", text: "示例数据：记录已整理。", fresh: false },
    { id: 2, from: "user", text: "示例数据：再看一眼。", fresh: false },
  ])

  return (
    <div className="grid">
      <div className="block">
        <h2>按钮</h2>
        <div className="row">
          <Button onClick={() => setSaved(true)}>保存</Button>
          <Button variant="secondary">次要</Button>
          <Button variant="ghost">幽灵</Button>
          <Button
            variant="secondary"
            loading={loading}
            aria-busy={loading}
            onClick={() => {
              setLoading(true)
              window.setTimeout(() => setLoading(false), reduced ? 0 : 700)
            }}
          >
            处理
          </Button>
        </div>
      </div>

      <div className="block">
        <h2>实现</h2>
        <div className="row">
          <RadixButton variant="secondary" aria-pressed={saved} onClick={() => setSaved((value) => !value)}>
            Radix
          </RadixButton>
          <Button variant="secondary" aria-pressed={saved} onClick={() => setSaved((value) => !value)}>
            Base UI
          </Button>
        </div>
        <p className="status" role="status">{saved ? "已保存" : "未保存"}</p>
      </div>

      <div className="block">
        <h2>分页</h2>
        <Tabs selectedIndex={tab} onSelect={setTab} idPrefix="records">
          {TABS.map((label, index) => (
            <TabsItem key={label} index={index} label={label} />
          ))}
        </Tabs>
        {TABS.map((label, index) => (
          <TabsPanel key={label} index={index} selectedIndex={tab} idPrefix="records">
            示例数据 · {label}
          </TabsPanel>
        ))}
      </div>

      <div className="block">
        <h2>选择</h2>
        <div className="wide">
        <Select value={fruit} onValueChange={setFruit}>
          <SelectTrigger placeholder="水果" aria-label="水果" />
          <SelectContent>
            {FRUITS.map((item, index) => (
              <SelectItem key={item.value} index={index} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        </div>
      </div>

      <div className="block">
        <h2>开关</h2>
        <Switch className="min-h-11 wide" label="通知" checked={notify} onToggle={() => setNotify((value) => !value)} />
      </div>

      <div className="block">
        <h2>滑块</h2>
        <div className="wide">
        <Slider
          label="强度"
          value={strength}
          min={0}
          max={100}
          step={10}
          onChange={(value) => {
            if (typeof value === "number") setStrength(value)
          }}
        />
        </div>
      </div>

      <div className="block">
        <h2>菜单</h2>
        <div className="row">
        <DropdownMenu>
          <DropdownTrigger render={<Button variant="secondary">范围</Button>} />
          <DropdownContent checkedIndex={scope}>
            {SCOPES.map((item, index) => (
              <MenuItem
                key={item.label}
                index={index}
                icon={item.icon}
                label={item.label}
                checked={scope === index}
                onSelect={() => setScope(index)}
              />
            ))}
          </DropdownContent>
        </DropdownMenu>
        </div>
      </div>

      <div className="block">
        <h2>对话框</h2>
        <div className="row">
        <Dialog>
          <DialogTrigger render={<Button variant="secondary">打开对话框</Button>} />
          <DialogContent size="sm" showCloseButton={false} className="max-w-[min(400px,calc(100vw-2rem))]">
            <DialogHeader>
              <DialogTitle>发布记录</DialogTitle>
            </DialogHeader>
            <p>示例数据</p>
            <DialogFooter>
              <DialogClose render={<Button variant="secondary">关闭</Button>} />
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <SpringMark nudge={nudge} reduced={reduced} />

      <div className="block span-2">
        <h2>消息</h2>
        <div className="messages">
          {messages.map((message) => (
            <ChatMessage key={message.id} from={message.from} initial={message.fresh ? undefined : false}>
              {message.text}
            </ChatMessage>
          ))}
        </div>
        <div className="row">
          <Button
            variant="secondary"
            onClick={() => {
              setMessages((current) => [
                ...current,
                { id: current.length + 1, from: "user", text: "示例数据：新的一条。", fresh: true },
              ])
            }}
          >
            发送
          </Button>
        </div>
      </div>

      <div className="block">
        <h2>进行中</h2>
        <ThinkingIndicator />
      </div>

      <ProximityList radius={proximity} reduced={reduced} />
    </div>
  )
}

function SpringMark({ nudge, reduced }: { nudge: number; reduced: boolean }) {
  const [shift, setShift] = useState(false)
  const seen = useRef(nudge)
  useEffect(() => {
    if (seen.current === nudge) return
    seen.current = nudge
    setShift((value) => !value)
  }, [nudge])

  return (
    <div className="block spring">
      <h2>弹簧</h2>
      <div className="row">
        <motion.div
          className="specimen"
          initial={false}
          animate={{ x: shift ? 72 : 0 }}
          transition={reduced ? { duration: 0 } : spring.slow}
        />
        <Button variant="secondary" onClick={() => setShift((value) => !value)}>
          移动
        </Button>
      </div>
    </div>
  )
}
