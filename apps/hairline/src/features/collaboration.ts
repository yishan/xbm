export const stages = [
  { owner: 'Dicembre', role: '规划', title: '整理目标与验收', detail: '把“做一个组件体验馆”拆成浏览、交互和协作演示三个可验证目标。', artifact: '目标清单 · 3 项验收条件', log: 'Dicembre → Grok：交付目标清单与验收条件。' },
  { owner: 'Grok', role: '审阅', title: '核对边界与风险', detail: '检查 19 个图形是否齐全，明确外部账号未接入，并标记窄屏与重复点击风险。', artifact: '审阅记录 · 2 项交互检查', log: 'Grok → Muse：交付已审阅方案与交互检查项。' },
  { owner: 'Muse', role: '执行', title: '生成可检查的结果', detail: '按审阅后的清单完成组件体验、状态切换和交接记录，形成演示结果。', artifact: '演示结果 · 3 项目标已覆盖', log: 'Muse → 用户：交付演示结果，等待人工验收。' },
] as const
export type Flow = { step: number; running: boolean; history: string[] }
export type Action = { type: 'start'|'pause'|'advance'|'tick'|'reset' }
export const initialFlow: Flow = { step: -1, running: false, history: [] }
export function flowReducer(state: Flow, action: Action): Flow {
  if (action.type === 'reset') return initialFlow
  if (action.type === 'pause') return { ...state, running: false }
  if (action.type === 'start') {
    if (state.running || state.step >= stages.length) return state
    return { ...state, step: Math.max(0, state.step), running: true }
  }
  if (action.type === 'tick' && !state.running) return state
  if (state.step >= stages.length) return state
  if (state.step === -1) return { ...state, step: 0, running: false }
  const step = state.step + 1
  return { step, running: action.type === 'tick' && step < stages.length, history: [...state.history, stages[state.step].log] }
}
