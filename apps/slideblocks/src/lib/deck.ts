// SlideBlocks-style layout, inspired by UniUni2000/slideblocks-skill (MIT).
// Deck copy: Social Writing, from Researcher brief 2026-10-05; approved by Yishan.

import type { Deck } from "@/lib/deck-types"

export const DECK: Deck = {
  title: "Personal Agent 的发展现状",
  speaker: "Tech Demos / Yishan",
  date: "2026-10-05",
  slides: [
    {
      kind: "title",
      id: "title",
      title: "Personal Agent 的发展现状",
      subtitle: "从聊天助手到能长期替人做事的代理",
      meta: [
        { label: "时间范围", value: "2023-10 至 2026-10" },
        { label: "资料", value: "Researcher 研究简报（2026-10-05）" },
        { label: "演讲人", value: "Tech Demos / Yishan" },
        { label: "日期", value: "2026-10-05" },
      ],
    },
    {
      kind: "agenda",
      id: "agenda",
      title: "议程",
      items: [
        "Personal Agent 是什么",
        "2023–2026 关键节点",
        "能力分层",
        "代表产品",
        "瓶颈与争议",
        "趋势与关键数字",
      ],
    },
    {
      kind: "definition",
      id: "what",
      title: "Personal Agent 是什么",
      definition: "面向个人、有长期记忆和工具权限、能持续执行任务的助手",
      contrasts: [
        { label: "和 chatbot 不同", text: "不只等用户发消息，也会被事件、日程、收件箱触发" },
        { label: "和 coding agent 不同", text: "动作范围是邮件、日程、浏览器、已连接应用和电脑，不只是代码仓库" },
      ],
      criteriaLabel: "判定标准（满足多数即可）",
      criteria: [
        "后台能继续运行",
        "能调用外部工具和账户",
        "有跨会话记忆或工作区",
        "敏感动作要审批",
      ],
    },
    {
      kind: "timeline",
      id: "timeline",
      title: "时间线：2023–2026 关键节点",
      events: [
        { year: "2023", date: "2023-10", text: "MemGPT 论文：像操作系统一样分页管理记忆，后来发展为 Letta" },
        { year: "2024", date: "2024-06", text: "Apple Intelligence：设备侧个人上下文和 App Intents" },
        { year: "2024", date: "2024-10-22", text: "Claude Computer Use 公测：截屏加键鼠操作电脑" },
        { year: "2025", date: "2025-01-14", text: "LangChain 提出 ambient agents：事件驱动，人通过 notify / question / review 介入" },
        { year: "2025", date: "2025-02", text: "Humane Ai Pin 关停，HP 以约 1.16 亿美元收购资产" },
        { year: "2026", date: "05-19", text: "Anthropic Managed Agents" },
        { year: "2026", date: "08-11", text: "Grok Bot beta" },
        { year: "2026", date: "08-19", text: "Microsoft ThinkingBox-Bench" },
        { year: "2026", date: "09-29", text: "OpenAI Dots" },
      ],
    },
    {
      kind: "layers",
      id: "layers",
      title: "能力分层",
      center: "Personal Agent",
      layers: [
        {
          name: "记忆",
          text: "跨会话保存偏好、项目约定和错误教训；Anthropic Dreams 读 1–100 份会话后重组记忆",
          note: "研究预览，公司自报",
        },
        {
          name: "工具调用",
          text: "插件、MCP；没有 API 时用计算机使用，直接登录网站、点按钮",
        },
        {
          name: "日程与邮件",
          text: "读日历、起草和发送邮件、跟进收件箱；ambient 模式多从这里开始",
        },
        {
          name: "多 agent",
          text: "主 agent 分派子 agent；Grok Bot 支持多个 Bot 并行和群聊协调",
          note: "公司自报",
        },
        {
          name: "电脑权限",
          text: "独立云电脑，可选连接用户本机，敏感操作要审批；OpenAI 称会在空闲时用只读工具扫描已连接应用",
          note: "公司自报",
        },
      ],
    },
    {
      kind: "products",
      id: "products",
      title: "代表产品",
      items: [
        {
          name: "OpenAI Dots",
          tag: "个人代理",
          text: "ChatGPT 里常驻的个人代理，每个 Dot 一台云电脑；2026-09-29 起向 Pro、Business Premium 等档位分批开放",
        },
        {
          name: "xAI Grok Bot",
          tag: "云电脑",
          text: "2026-08-11 beta；在云电脑里登录真实应用完成任务，再交给用户审批",
        },
        {
          name: "Anthropic",
          tag: "平台",
          text: "Computer Use（2024-10）开始操作图形界面；Managed Agents（2026）偏平台，主打可部署记忆、outcomes、多 agent",
        },
        {
          name: "Microsoft Copilot / Apple Intelligence",
          tag: "工作场景 / 设备侧",
          text: "Microsoft Copilot 偏工作场景和企业治理；Apple Intelligence 偏设备侧个人上下文，不是云电脑式常驻代理",
        },
        {
          name: "开源",
          tag: "开源",
          text: "Open Interpreter（本机电脑控制）、MemGPT / Letta（记忆框架）、AutoGPT（早期自主目标循环）",
        },
        {
          name: "硬件路线",
          tag: "硬件",
          text: "Humane Ai Pin、Rabbit R1；Humane 已于 2025-02 关停并出售资产",
        },
      ],
    },
    {
      kind: "challenges",
      id: "challenges",
      title: "瓶颈与争议",
      items: [
        { name: "隐私", text: "代理登录邮箱和日历，接触的是高敏数据" },
        { name: "安全", text: "prompt injection 可能写进可写的记忆（Anthropic 文档警告）" },
        { name: "可靠执行", text: "ThinkingBox 上最强模型单次通过率约 65%，同一题 20 次都通过的只有约 25%" },
        { name: "审批频率", text: "早期用户 Ali Abouelatta 给 Dot 配了公司邮箱和 Linear，抱怨审批太频繁（2026-10-04）" },
        { name: "成本", text: "Dots 绑定 Pro 档，Grok Bot 绑定 SuperGrok / Cursor 付费档；云电脑实际费用：待补（公开信息不透明）" },
        { name: "评测", text: "还没有统一的个人助手基准；ThinkingBox 测的是有状态的业务流程，不是用户满意度" },
      ],
    },
    {
      kind: "trends",
      id: "trends",
      title: "近 12 个月的 4 个趋势",
      items: [
        { name: "形态收敛", text: "云电脑、应用登录、审批，Dots 和 Grok Bot 结构相同" },
        { name: "触发方式变了", text: "从聊天触发转向事件触发，LangChain 的 notify / question / review 已经做进产品" },
        { name: "记忆成为差异点", text: "从会话记忆，到持久记忆库，再到后台异步整理（Anthropic Dreams）" },
        { name: "独立硬件降温", text: "Humane 失败后，主流回到 App 加云电脑" },
      ],
    },
    {
      kind: "metrics",
      id: "metrics",
      title: "关键数字",
      items: [
        { value: "4000+", label: "Dots 可接入的应用数", note: "OpenAI 自报" },
        { value: "7 周", label: "Grok Bot（2026-08-11）比 Dots（2026-09-29）早发布的时间" },
        { value: "507 × 20", label: "ThinkingBox 的题数，以及每题重复跑的次数" },
        { value: "65.36% / 25.25%", label: "GPT-5.4 在 ThinkingBox 上的单次通过率 / 20 次都通过的比例" },
        { value: "77.5%", label: "失败记录里属于工具使用或出错后恢复失败的比例" },
        { value: "约 1.16 亿美元", label: "HP 收购 Humane 资产的价格", note: "2025-02" },
      ],
    },
    {
      kind: "closing",
      id: "closing",
      title: "收尾",
      points: [
        "2026 年 Personal Agent 的基本形态：云电脑、应用登录、长期记忆、审批",
        "能接的工具越来越多，难点转到可靠执行：同一任务 20 次都做对的比例约 25%",
        "成本和统一评测还缺公开数据：待补",
      ],
      callout: "审批太多用户嫌烦，太少有隐私和安全风险，这个平衡还没找到",
      cta: "提问与讨论",
    },
  ],
}
