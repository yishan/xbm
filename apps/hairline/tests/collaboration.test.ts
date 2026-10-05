import { describe, expect, test } from 'bun:test'
import { flowReducer, initialFlow } from '../src/features/collaboration'
describe('模拟交接状态机', () => {
  test('重复开始不跳步；每个交接只记一次；完成后不追加', () => {
    let state = flowReducer(initialFlow, { type: 'start' })
    expect(flowReducer(state, { type: 'start' })).toEqual(state)
    for (let i = 0; i < 10; i++) state = flowReducer(state, { type: 'tick' })
    expect(state.step).toBe(3)
    expect(state.history).toHaveLength(3)
    expect(state.running).toBe(false)
  })
  test('暂停拒绝旧 tick；单步停住；重置清空所有状态', () => {
    let state = flowReducer(initialFlow, { type: 'start' })
    state = flowReducer(state, { type: 'pause' })
    expect(flowReducer(state, { type: 'tick' })).toEqual(state)
    state = flowReducer(state, { type: 'advance' })
    expect(state.step).toBe(1)
    expect(state.running).toBe(false)
    state = flowReducer(state, { type: 'reset' })
    expect(state).toEqual(initialFlow)
    expect(flowReducer(state, { type: 'tick' })).toEqual(initialFlow)
  })
})
