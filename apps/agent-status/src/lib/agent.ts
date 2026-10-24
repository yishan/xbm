/**
 * Shared model for the agent-status demo.
 * Pure TypeScript only: no React, no JSX. All example data is made up (示例数据).
 */

/** Discrete states of an agent run. */
export type AgentState = "idle" | "thinking" | "tool" | "approval" | "done" | "error";

/** Colour tones used across the UI; mapped to Tailwind classes in TONE_CLASSES. */
export type Tone = "neutral" | "violet" | "sky" | "amber" | "emerald" | "rose";

/** Chinese label + hint and tone for each agent state. */
export const STATE_META: Record<AgentState, { label: string; hint: string; tone: Tone }> = {
  idle: { label: "空闲", hint: "等待新任务", tone: "neutral" },
  thinking: { label: "思考中", hint: "正在规划下一步", tone: "violet" },
  tool: { label: "调用工具", hint: "正在执行工具调用", tone: "sky" },
  approval: { label: "等待批准", hint: "需要你确认后才能继续", tone: "amber" },
  done: { label: "已完成", hint: "任务完成", tone: "emerald" },
  error: { label: "出错", hint: "运行中断", tone: "rose" },
};

/**
 * Tailwind class strings per tone.
 * Full literal strings so the Tailwind compiler can see them; works in light AND dark.
 */
export const TONE_CLASSES: Record<Tone, { dot: string; text: string; bg: string; ring: string; bar: string }> = {
  neutral: {
    dot: "bg-zinc-400",
    text: "text-zinc-700 dark:text-zinc-300",
    bg: "bg-zinc-500/10 dark:bg-zinc-400/10",
    ring: "ring-zinc-500/30 dark:ring-zinc-400/30",
    bar: "bg-zinc-500 dark:bg-zinc-400",
  },
  violet: {
    dot: "bg-violet-500",
    text: "text-violet-700 dark:text-violet-300",
    bg: "bg-violet-500/10 dark:bg-violet-400/10",
    ring: "ring-violet-500/30 dark:ring-violet-400/30",
    bar: "bg-violet-500 dark:bg-violet-400",
  },
  sky: {
    dot: "bg-sky-500",
    text: "text-sky-700 dark:text-sky-300",
    bg: "bg-sky-500/10 dark:bg-sky-400/10",
    ring: "ring-sky-500/30 dark:ring-sky-400/30",
    bar: "bg-sky-500 dark:bg-sky-400",
  },
  amber: {
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-500/10 dark:bg-amber-400/10",
    ring: "ring-amber-500/30 dark:ring-amber-400/30",
    bar: "bg-amber-500 dark:bg-amber-400",
  },
  emerald: {
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-500/10 dark:bg-emerald-400/10",
    ring: "ring-emerald-500/30 dark:ring-emerald-400/30",
    bar: "bg-emerald-500 dark:bg-emerald-400",
  },
  rose: {
    dot: "bg-rose-500",
    text: "text-rose-700 dark:text-rose-300",
    bg: "bg-rose-500/10 dark:bg-rose-400/10",
    ring: "ring-rose-500/30 dark:ring-rose-400/30",
    bar: "bg-rose-500 dark:bg-rose-400",
  },
};

/** Format elapsed milliseconds as "m:ss" (under an hour) or "h:mm:ss". Negative -> "0:00". */
export function formatElapsed(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "0:00";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number): string => String(value).padStart(2, "0");

  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${minutes}:${pad(seconds)}`;
}

/** One step of a scripted agent run. */
export type RunStep = {
  id: string;
  state: AgentState;
  title: string;
  detail: string;
  tool?: string;
  durationMs: number;
  credits: number;
};

/** Task shown for the scripted run. */
export const RUN_TASK = "整理本周会议纪要并发给团队";

/** Example run (示例数据). durationMs 0 means the step waits for the user. */
export const SCRIPTED_RUN: RunStep[] = [
  {
    id: "s1",
    state: "thinking",
    title: "理解任务",
    detail: "读取任务说明，拆成 3 步",
    durationMs: 1800,
    credits: 2,
  },
  {
    id: "s2",
    state: "tool",
    title: "搜索文档",
    detail: 'search_docs("会议纪要 本周") → 4 篇',
    tool: "search_docs",
    durationMs: 2400,
    credits: 6,
  },
  {
    id: "s3",
    state: "thinking",
    title: "起草摘要",
    detail: "合并 4 篇纪要，提炼 6 条行动项",
    durationMs: 2200,
    credits: 9,
  },
  {
    id: "s4",
    state: "tool",
    title: "生成表格",
    detail: "create_table(行动项) → 6 行",
    tool: "create_table",
    durationMs: 1600,
    credits: 4,
  },
  {
    id: "s5",
    state: "approval",
    title: "发送邮件前确认",
    detail: "将发送给 ada@studio.dev 等 5 人",
    tool: "send_email",
    durationMs: 0,
    credits: 0,
  },
  {
    id: "s6",
    state: "tool",
    title: "发送邮件",
    detail: "send_email → 5 位收件人",
    tool: "send_email",
    durationMs: 1400,
    credits: 3,
  },
  {
    id: "s7",
    state: "done",
    title: "完成",
    detail: "纪要已发送，用时与积分见下方",
    durationMs: 0,
    credits: 0,
  },
];

/** Total credits spent by the scripted run. */
export const RUN_TOTAL_CREDITS = SCRIPTED_RUN.reduce((sum, step) => sum + step.credits, 0);

/** A sample bot in the fleet overview. */
export type ExampleBot = {
  id: string;
  name: string;
  role: string;
  state: AgentState;
  step: string;
  elapsedMs: number;
  creditsUsed: number;
};

/** Six invented bots (示例数据), one per state. */
export const EXAMPLE_BOTS: ExampleBot[] = [
  {
    id: "otter",
    name: "Otter",
    role: "研究助理",
    state: "thinking",
    step: "比较 3 篇论文的结论",
    elapsedMs: 42_000,
    creditsUsed: 18,
  },
  {
    id: "maple",
    name: "Maple",
    role: "日程助理",
    state: "approval",
    step: "改约周四 15:00 的会议？",
    elapsedMs: 95_000,
    creditsUsed: 7,
  },
  {
    id: "comet",
    name: "Comet",
    role: "代码助理",
    state: "tool",
    step: "run_tests → 128 项",
    elapsedMs: 260_000,
    creditsUsed: 64,
  },
  {
    id: "juniper",
    name: "Juniper",
    role: "写作助理",
    state: "done",
    step: "周报草稿已完成",
    elapsedMs: 610_000,
    creditsUsed: 35,
  },
  {
    id: "pebble",
    name: "Pebble",
    role: "收件箱助理",
    state: "error",
    step: "邮箱授权已过期",
    elapsedMs: 12_000,
    creditsUsed: 2,
  },
  {
    id: "kite",
    name: "Kite",
    role: "数据助理",
    state: "idle",
    step: "等待新任务",
    elapsedMs: 0,
    creditsUsed: 0,
  },
];

/** A credit pool shown in the usage component. */
export type CreditPool = {
  id: string;
  label: string;
  used: number;
  total: number;
  tone: Tone;
  note: string;
};

/** Single shared pool for all assistants and models. */
export const SHARED_POOL: CreditPool = {
  id: "all",
  label: "统一额度",
  used: 1240,
  total: 3000,
  tone: "violet",
  note: "所有助理和模型共用一个余额",
};

/** Split pools (the "two wallets" example). */
export const SPLIT_POOLS: CreditPool[] = [
  {
    id: "chat",
    label: "对话额度",
    used: 820,
    total: 1000,
    tone: "sky",
    note: "聊天、搜索按次扣",
  },
  {
    id: "assistant",
    label: "助理额度",
    used: 420,
    total: 2000,
    tone: "amber",
    note: "后台助理运行按步骤扣",
  },
];

/** Usage per bot; sums to the shared pool's used amount (1240). */
export const USAGE_BY_BOT: { name: string; credits: number; tone: Tone }[] = [
  { name: "Otter", credits: 380, tone: "violet" },
  { name: "Comet", credits: 520, tone: "sky" },
  { name: "Juniper", credits: 210, tone: "emerald" },
  { name: "Maple", credits: 90, tone: "amber" },
  { name: "Pebble", credits: 40, tone: "rose" },
];

/** Explainer copy for the two-wallet problem. */
export const TWO_WALLET_NOTE =
  "两个钱包的问题：同一个产品里聊天和助理各扣各的额度，一边见底时另一边还剩很多，用户很难判断还能做什么。统一额度把余额放在一个数字里，再按助理拆开看去向。";
