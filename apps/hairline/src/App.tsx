import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, Check, ExternalLink, Pause, Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import * as Hairline from '@lucasmarkes/hairline/react'
import { categories, figures, translateRead } from './features/catalogue'
import { flowReducer, initialFlow, stages } from './features/collaboration'
import type { Category } from './features/catalogue'
import type { Action, Flow } from './features/collaboration'
import type { Dispatch } from 'react'

type Theme = 'auto' | 'light' | 'dark'
function useMedia(query: string) {
  const [matches, setMatches] = useState(() => matchMedia(query).matches)
  useEffect(() => {
    const media = matchMedia(query)
    const update = () => setMatches(media.matches)
    media.addEventListener('change', update)
    update()
    return () => media.removeEventListener('change', update)
  }, [query])
  return matches
}

function FigureViewer({ entry, intensity, theme }: { entry: typeof figures[number]; intensity: number; theme: Theme }) {
  const [read, setRead] = useState('rest')
  const latest = useRef('rest')
  const Figure = Hairline[entry.name]
  const onRead = useCallback((text: string) => { latest.current = text }, [])
  useEffect(() => {
    const timer = setInterval(() => setRead(latest.current), 160)
    return () => clearInterval(timer)
  }, [])
  return <>
    <div className="figure-well">
      <span className="axis-label">INTERACTION / {entry.id.toUpperCase()}</span>
      <Figure className="main-figure" label={`${entry.zh}：${entry.hint}`} theme={theme} intensity={intensity} onRead={onRead} />
      <span className="figure-note">{entry.name === 'Riffle' ? '指针 / 触摸 / 左右方向键' : '指针 / 触摸探索'}</span>
      <span className="crosshair top-left">+</span><span className="crosshair bottom-right">+</span>
    </div>
    <aside className="inspector">
      <span className="eyebrow">使用说明</span>
      <h3>{entry.zh}</h3><p>{entry.hint}</p>
      <div className="readout"><span className="eyebrow"><i className="signal-dot" /> 实时读数</span>
        <strong data-testid="readout">{translateRead(read, entry.id)}</strong><code>{read || '—'}</code>
      </div>
      <div className="explanation"><span className="eyebrow">提高强度后</span><p>{entry.stronger}。</p></div>
      <div className="explanation"><span className="eyebrow">场景线索</span><p>{entry.scene}</p></div>
      <span className="small-note">读数来自图形本身，每 160ms 更新。除了 Riffle，图形以指针或触摸探索为主。</span>
    </aside>
  </>
}

function Collaboration({ flow, dispatch, intensity, theme }: { flow: Flow; dispatch: Dispatch<Action>; intensity: number; theme: Theme }) {
  const active = stages[Math.min(Math.max(flow.step, 0), 2)]
  const status = flow.step === -1 ? '等待开始' : flow.step === 3 ? '待人工验收' : flow.running ? '自动运行中' : '已暂停 · 可单步'
  return <section className="collaboration" aria-labelledby="flow-title">
    <div className="section-heading"><div><span className="eyebrow">02 / SCENARIO</span><h2 id="flow-title">一次任务，三次交接<span className="simulation-tag">本地模拟</span></h2></div><span className="small-note">固定脚本 · 无外部调用</span></div>
    <div className="task-strip"><span className="task-id">TASK / 001</span><div><strong>为一个新点子，制作可验收的组件体验馆</strong><p>目标被规划、审阅和执行，交接物随状态逐项生成。</p></div><span className="flow-status" role="status">{status}</span></div>
    <div className="agent-grid">
      {stages.map((stage, i) => {
        const done = flow.step > i
        const current = flow.step === i
        const Figure = Hairline[figures.find(f => f.id === ['branches','dish','terminal'][i])!.name]
        return <article key={stage.owner} className={`agent ${current ? 'current' : ''} ${done ? 'done' : ''}`}>
          <div className="agent-heading"><span className="agent-index">0{i + 1}</span><span className="agent-state">{done ? <><Check size={13} /> 已交接</> : current ? '处理中' : '等待接收'}</span></div>
          <Figure theme={theme} intensity={intensity} label={`${stage.owner} ${stage.role}的示意图，不代表真实产品集成`} className="agent-figure" />
          <div className="agent-name"><h3>{stage.owner}</h3><span>{stage.role}</span></div>
          <p>{stage.detail}</p>
          <div className="handoff-artifact"><span className="eyebrow">交接物</span><strong>{done ? stage.artifact : current ? '正在整理…' : '接收任务后生成'}</strong></div>
          {i < 2 && <span className="connector" aria-hidden="true"><ArrowRight size={20}/></span>}
        </article>
      })}
    </div>
    <div className="flow-bottom"><div className="flow-controls">
      <div className="progress-count"><b>{Math.max(0, flow.step)}<span>/3</span></b><span>已完成交接</span></div>
      <div className="control-buttons">
        <Button size="lg" onClick={() => dispatch({ type: 'start' })} disabled={flow.running || flow.step === 3}><Play />{flow.step === -1 ? '开始演示' : '继续自动'}</Button>
        <Button variant="outline" size="lg" onClick={() => dispatch({ type:'pause' })} disabled={!flow.running}><Pause />暂停</Button>
        <Button variant="outline" size="lg" onClick={() => dispatch({ type:'advance' })} disabled={flow.running || flow.step === 3}>下一步<ArrowRight /></Button>
        <Button variant="ghost" size="lg" onClick={() => dispatch({ type:'reset' })}><RotateCcw />重置</Button>
      </div>
      <p>{flow.step === -1 ? '开始后，每 2.4 秒完成一次交接。也可按“下一步”从规划开始。' : flow.step === 3 ? '演示结果已交付。真实任务仍需用户验收；重置可重新演示。' : `当前：${active.owner} · ${active.title}。暂停后可单步推进。`}</p>
    </div>
    <div className="handoff-log"><span className="eyebrow">交接记录 <span>{flow.history.length.toString().padStart(2,'0')}</span></span>
      <ol aria-live="polite">{flow.history.length === 0 ? <li className="empty-log">尚无交接。启动任务，观察上下文如何传递。</li> : flow.history.map((entry,i) => <li key={entry}><span>0{i+1}</span>{entry}</li>)}</ol>
    </div></div>
    <p className="simulation-note">这是固定流程的模拟演示。Dicembre、Grok、Muse 仅作为场景角色名称；未接入这些产品账号，也未调用任何外部助手。切换到组件体验或离开页面时会暂停自动流程。</p>
  </section>
}

export default function App() {
  const [theme, setTheme] = useState<Theme>('auto')
  const [intensity, setIntensity] = useState(.5)
  const [view, setView] = useState<'gallery'|'flow'>('gallery')
  const [category, setCategory] = useState<Category|'all'>('all')
  const [selected, setSelected] = useState('patch')
  const [flow, dispatch] = useReducer(flowReducer, initialFlow)
  const systemDark = useMedia('(prefers-color-scheme: dark)')
  const reducedMotion = useMedia('(prefers-reduced-motion: reduce)')
  const dark = theme === 'dark' || (theme === 'auto' && systemDark)
  const filtered = figures.filter(f => category === 'all' || f.category === category)
  const entry = figures.find(f => f.id === selected)!
  const index = filtered.findIndex(f => f.id === selected)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  }, [dark])
  useEffect(() => {
    if (!flow.running || view !== 'flow') return
    const timer = setTimeout(() => dispatch({ type:'tick' }), 2400)
    return () => clearTimeout(timer)
  }, [flow.running, flow.step, view])
  useEffect(() => {
    const pause = () => { if (document.hidden) dispatch({ type:'pause' }) }
    document.addEventListener('visibilitychange', pause)
    return () => document.removeEventListener('visibilitychange', pause)
  }, [])
  function selectCategory(id: Category|'all') {
    setCategory(id)
    if (id !== 'all' && entry.category !== id) setSelected(figures.find(f => f.category === id)!.id)
  }
  function switchView(next: 'gallery'|'flow') {
    if (next === 'gallery') dispatch({ type:'pause' })
    setView(next)
  }
  return <div className="app-shell">
    <a href="#experience" className="skip-link">跳转到体验区</a>
    <header className="site-header"><a className="brand" href={import.meta.env.BASE_URL}><svg viewBox="0 0 28 28" aria-hidden="true"><path d="M3 9 14 3l11 6v10l-11 6L3 19ZM3 9l11 6 11-6M14 15v10M3 14l11 6 11-6" /></svg>hairline<span>实验室</span></a>
      <nav aria-label="体验导航"><button aria-pressed={view==='gallery'} onClick={() => switchView('gallery')}>01 组件体验</button><button aria-pressed={view==='flow'} onClick={() => switchView('flow')}>02 协作场景</button></nav>
      <a className="source-link" href="https://github.com/lucasmarkes/hairline" target="_blank" rel="noreferrer">源码 <ExternalLink size={13}/></a>
    </header>
    <main id="experience">
      <div className="intro"><div><span className="eyebrow">ISOMETRIC FIGURES / V0.2.0</span><h1>让细线，回应你的动作。</h1><p>19 个等距图形，一套交互语言。探索组件，也观察助手之间的任务流动。</p></div><div className="intro-index"><strong>19<span>/07</span></strong><span>图形 / 分类</span></div></div>
      <div className="toolbar"><div className="theme-control"><label htmlFor="theme">画布主题</label><select id="theme" value={theme} onChange={e => setTheme(e.target.value as Theme)}><option value="light">明亮</option><option value="dark">暗色</option><option value="auto">跟随系统</option></select></div>
        <div className="intensity-control"><label htmlFor="intensity">交互强度</label><span className="range-word">轻柔</span><input id="intensity" type="range" min="0" max="1" step="0.05" value={intensity} onChange={e=>setIntensity(Number(e.target.value))} /><span className="range-word">鲜明</span><output htmlFor="intensity">{intensity.toFixed(2)}</output></div>
        <span className="motion-mode">{reducedMotion ? '减少动态效果已启用' : 'SVG · 指针响应'}</span>
      </div>
      {view === 'gallery' ? <section className="gallery" aria-labelledby="gallery-title">
        <aside className="category-sidebar"><span className="eyebrow">01 / COLLECTION</span><h2 id="gallery-title">图形目录</h2><div className="category-list">
          <button aria-pressed={category==='all'} onClick={()=>selectCategory('all')}><span>全部图形</span><small>19</small></button>
          {categories.map(c=><button key={c.id} aria-pressed={category===c.id} onClick={()=>selectCategory(c.id)}><span>{c.name}<em>{c.en}</em></span><small>{figures.filter(f=>f.category===c.id).length.toString().padStart(2,'0')}</small></button>)}
        </div><div className="sidebar-foot"><ArrowDown size={17}/><p>选一个图形，<br/>在画布上探索。</p></div></aside>
        <div className="gallery-main"><div className="figure-heading"><div><span className="eyebrow">{categories.find(c=>c.id===entry.category)!.en.toUpperCase()} / {String(figures.indexOf(entry)+1).padStart(2,'0')}</span><h2>{entry.name}<span>{entry.zh}</span></h2></div><div className="pager"><Button variant="outline" size="icon" aria-label="上一个图形" onClick={()=>setSelected(filtered[(index-1+filtered.length)%filtered.length].id)}><ArrowLeft/></Button><span>{index+1} / {filtered.length}</span><Button variant="outline" size="icon" aria-label="下一个图形" onClick={()=>setSelected(filtered[(index+1)%filtered.length].id)}><ArrowRight/></Button></div></div>
          <div className="figure-body"><FigureViewer key={entry.id} entry={entry} intensity={intensity} theme={theme}/></div>
          <div className="figure-picker" aria-label="选择图形">{filtered.map(f=><button key={f.id} data-figure={f.id} aria-pressed={selected===f.id} onClick={()=>setSelected(f.id)}><span>{f.name}</span><small>{f.zh}</small></button>)}</div>
        </div>
      </section> : <Collaboration flow={flow} dispatch={dispatch} intensity={intensity} theme={theme}/>}
      <footer><span>基于 Hairline · Lucas Marques · MIT</span><a href="https://hairline.lucasmarkes.com/figures" target="_blank" rel="noreferrer">官方图形目录 <ExternalLink size={12}/></a><span>xbm / hairline</span></footer>
    </main>
  </div>
}
