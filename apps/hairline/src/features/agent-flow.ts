import type { FigureName } from './catalogue'
// 示例数据：一次「主 agent → 子 agent」任务的固定脚本，不调用任何外部服务。
export const agentSteps: { figure: FigureName; id: string; title: string; who: string; detail: string; artifact: string }[] = [
  { figure: 'Relay', id: 'relay', title: '交接', who: '主 agent → 子 agent', detail: '主 agent 把「升级一个 demo 的上游依赖」拆成子任务，沿 relay 的路径一跳一跳交给子 agent。', artifact: '任务说明 · 验收条件 3 项' },
  { figure: 'Rebuild', id: 'rebuild', title: '依赖更新', who: '子 agent', detail: '子 agent 把上游包从 0.2.0 升到 0.5.0；依赖它的页面、截图、视频依次重建，就像 rebuild 里被依赖的包先浮起。', artifact: 'package.json · bun.lock · 重新构建' },
  { figure: 'Stack', id: 'stack', title: '调用栈', who: '子 agent → 工具', detail: '执行中子 agent 调用构建、截图、录屏工具；stack 把正在运行的那一帧打开，上方的帧抬起。', artifact: 'build → shoot → record' },
  { figure: 'Format', id: 'format', title: '整理输出', who: '子 agent', detail: '交付前把日志和 PR 说明整理规整，format 一行行摆正。', artifact: 'PR 说明 · 工作相关内容清单' },
  { figure: 'Settle', id: 'settle', title: '合流回报', who: '子 agent → 主 agent', detail: '各子任务的结果归位成一棵树，主 agent 汇总后交给人验收；合并仍由人决定。', artifact: '一个未合并的 PR' },
]
