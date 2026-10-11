// Contract between the scripted "agent" and the generative UI registry.
export type WeatherProps = { city: string; tempC: number; condition: "sunny" | "cloudy" | "rain" | "storm"; humidity: number; windKph: number; forecast: { day: string; highC: number; lowC: number; condition: "sunny" | "cloudy" | "rain" | "storm" }[] }
export type MetricChartProps = { title: string; unit: string; series: { label: string; value: number }[]; deltaPct: number }
export type TripFormProps = { destination: string; nights: number; travellers: number; budgetCny: number; onSubmit?: (summary: string) => void }
export type TaskBoardProps = { title: string; tasks: { id: string; label: string; owner: string; done: boolean }[] }
export type PlanCompareProps = { plans: { id: string; name: string; priceCny: number; features: string[]; highlight?: boolean }[]; onSelect?: (planName: string) => void }

export type UiCall =
  | { tool: "render_weather"; props: WeatherProps }
  | { tool: "render_metric_chart"; props: MetricChartProps }
  | { tool: "render_trip_form"; props: TripFormProps }
  | { tool: "render_task_board"; props: TaskBoardProps }
  | { tool: "render_plan_compare"; props: PlanCompareProps }

export type Scenario = { id: string; chip: string; keywords: string[]; thinking: string; text: string; call: UiCall }

export type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "agent"; text: string; call?: UiCall; status: "thinking" | "streaming" | "calling" | "done" }
