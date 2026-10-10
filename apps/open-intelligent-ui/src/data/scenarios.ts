import type { Scenario } from "@/genui/types"

// Fictional example data for the scripted demo agent (示例数据).
export const SCENARIOS: Scenario[] = [
  {
    id: "weather-shanghai",
    chip: "上海天气",
    keywords: ["天气", "上海", "气温", "温度", "下雨", "weather", "shanghai", "temperature"],
    thinking: "查看上海今天的天气和未来几天的预报…",
    text: "上海今天多云，气温 18°C，湿度偏高。未来几天以晴到多云为主，周三、周四有小雨，出门记得带伞。",
    call: {
      tool: "render_weather",
      props: {
        city: "上海",
        tempC: 18,
        condition: "cloudy",
        humidity: 72,
        windKph: 14,
        forecast: [
          { day: "周一", highC: 20, lowC: 13, condition: "cloudy" },
          { day: "周二", highC: 22, lowC: 14, condition: "sunny" },
          { day: "周三", highC: 19, lowC: 15, condition: "rain" },
          { day: "周四", highC: 17, lowC: 12, condition: "rain" },
          { day: "周五", highC: 21, lowC: 14, condition: "sunny" },
        ],
      },
    },
  },
  {
    id: "metric-weekly-visits",
    chip: "本周访问量",
    keywords: ["访问量", "数据", "指标", "统计", "图表", "趋势", "metric", "chart", "analytics", "visits", "traffic"],
    thinking: "汇总本周 xbm demo 的访问数据并生成趋势图…",
    text: "这是本周 xbm demo 的访问量，周四到周五增长明显，整体比上周提升了约 18%。",
    call: {
      tool: "render_metric_chart",
      props: {
        title: "本周 xbm demo 访问量",
        unit: "次",
        series: [
          { label: "周一", value: 320 },
          { label: "周二", value: 480 },
          { label: "周三", value: 410 },
          { label: "周四", value: 620 },
          { label: "周五", value: 760 },
          { label: "周六", value: 540 },
          { label: "周日", value: 390 },
        ],
        deltaPct: 18.4,
      },
    },
  },
  {
    id: "trip-hangzhou",
    chip: "规划杭州周末",
    keywords: ["旅行", "旅游", "行程", "杭州", "周末", "规划", "trip", "travel", "hangzhou", "weekend", "itinerary"],
    thinking: "为杭州周末出行整理一份行程草案…",
    text: "帮你按两人的杭州周末做了个初步方案，你可以先调整天数和预算，我们再细化景点。",
    call: {
      tool: "render_trip_form",
      props: {
        destination: "杭州",
        nights: 2,
        travellers: 2,
        budgetCny: 3000,
      },
    },
  },
  {
    id: "task-release",
    chip: "发布清单",
    keywords: ["任务", "清单", "待办", "发布", "看板", "task", "todo", "board", "release", "checklist"],
    thinking: "梳理本次发布需要完成的检查项…",
    text: "这是本次发布的清单，代码已冻结，剩下的主要是回归测试和文档更新。",
    call: {
      tool: "render_task_board",
      props: {
        title: "发布清单",
        tasks: [
          { id: "t1", label: "冻结代码并拉发布分支", owner: "小夏", done: true },
          { id: "t2", label: "回归测试全量用例", owner: "阿泽", done: false },
          { id: "t3", label: "更新变更日志", owner: "小夏", done: false },
          { id: "t4", label: "通知运营与客服", owner: "林可", done: false },
          { id: "t5", label: "灰度发布到 5% 流量", owner: "阿泽", done: false },
        ],
      },
    },
  },
  {
    id: "plan-compare",
    chip: "选一个套餐",
    keywords: ["套餐", "方案", "价格", "对比", "订阅", "plan", "pricing", "compare", "subscription"],
    thinking: "整理几个可选套餐并对比差异…",
    text: "下面是三个套餐的对比，专业版价格和功能比较均衡，多数人推荐它。",
    call: {
      tool: "render_plan_compare",
      props: {
        plans: [
          {
            id: "basic",
            name: "基础版",
            priceCny: 0,
            features: ["1 个项目", "社区支持", "基础组件"],
          },
          {
            id: "pro",
            name: "专业版",
            priceCny: 99,
            features: ["10 个项目", "优先支持", "全部组件", "自定义主题"],
            highlight: true,
          },
          {
            id: "team",
            name: "团队版",
            priceCny: 299,
            features: ["无限项目", "专属客服", "全部组件", "自定义主题", "权限管理"],
          },
        ],
      },
    },
  },
]

// Case-insensitive keyword match. Returns the scenario with the longest
// matching keyword, or null when nothing matches.
export function matchScenario(input: string): Scenario | null {
  const normalized = input.trim().toLowerCase()
  if (!normalized) return null

  let best: Scenario | null = null
  let bestLength = 0

  for (const scenario of SCENARIOS) {
    for (const keyword of scenario.keywords) {
      const candidate = keyword.toLowerCase()
      if (candidate.length > bestLength && normalized.includes(candidate)) {
        best = scenario
        bestLength = candidate.length
      }
    }
  }

  return best
}
