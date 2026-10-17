import approvalSpec from "@/specs/approval.json"
import galleryGanttSpec from "@/specs/gallery-gantt.json"
import pipelineSpec from "@/specs/pipeline.json"
import productFlowSpec from "@/specs/product-flow.json"
import sankeySpec from "@/specs/sankey.json"

export type DiagramInfo = {
  id: string
  title: string
  kind: string
  summary: string
  sample: boolean
  spec: unknown
  details: Record<string, string>
}

export const DIAGRAMS: DiagramInfo[] = [
  {
    id: "pipeline",
    title: "夜间流水线",
    kind: "架构图",
    sample: false,
    summary:
      "xbm 每晚从书签挑一个开源项目做 demo：挑选、审批、构建、验证、开 PR、发报告。",
    spec: pipelineSpec,
    details: {
      bookmarks: "公开的 X 书签是候选来源。",
      pick: "挑一个值得做的开源项目，写下许可证和粗略计划。",
      approval: "关键闸门：只有在聊天里明确批准后才会构建。",
      build: "按仓库规则（Bun、Vite、3 天发布期）搭建 demo。",
      verify:
        "用 verify-xbm 技能：构建、打开页面、驱动主交互、截图并做敏感信息扫描。",
      pr: "开一个未合并的 PR，附截图和视频，等人审阅。",
      report: "把 PR 链接、截图和问题汇总成一份报告。",
      skip: "没批准就跳过本次，不做任何改动。",
      seen: "已提议/已上线的书签记在公开 JSON 里，避免重复。",
    },
  },
  {
    id: "approval",
    title: "审批对话",
    kind: "时序图",
    sample: false,
    summary: "候选先发给 Yishan；批准才继续，未批准就跳过。",
    spec: approvalSpec,
    details: {
      routine: "定时运行，负责挑选并发出候选。",
      owner: "唯一的审批人，在聊天中回复批准或不批准。",
      agent: "接到批准后在独立分支上构建并验证。",
      github: "公开仓库 yishan/xbm，PR 保持未合并。",
    },
  },
  {
    id: "gallery-gantt",
    title: "上线时间线",
    kind: "甘特图",
    sample: false,
    summary: "画廊每个 demo 从收藏到上线的日期，来自公开 tracking 数据。",
    spec: galleryGanttSpec,
    details: {},
  },
  {
    id: "product-flow",
    title: "产品流程",
    kind: "流程图",
    sample: true,
    summary: "通用的需求评审 → 设计 → 开发 → 上线流程，示例数据。",
    spec: productFlowSpec,
    details: {
      req: "需求进入流程的起点。",
      review: "评审决定需求是否进入设计。",
      more: "信息不足时补充后重新提出。",
      design: "交互与视觉方案。",
      dev: "按设计实现。",
      test: "测试决定能否上线。",
      fix: "修复问题后重新提测。",
      launch: "发布上线。",
    },
  },
  {
    id: "sankey",
    title: "需求流转",
    kind: "桑基图",
    sample: true,
    summary: "一个季度的需求来源与去向，数字为虚构的示例数据。",
    spec: sankeySpec,
    details: {
      "用户反馈": "示例：48 个来自用户反馈。",
      "数据分析": "示例：26 个来自数据分析。",
      "业务提出": "示例：36 个由业务方提出。",
      "评审": "示例：110 个需求进入评审。",
      "排期开发": "示例：62 个排期开发。",
      "搁置": "示例：30 个暂时搁置。",
      "合并到其他需求": "示例：18 个合并到其他需求。",
      "已上线": "示例：50 个已上线。",
      "延期": "示例：12 个延期。",
    },
  },
]
