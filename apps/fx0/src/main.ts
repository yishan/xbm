import './style.css'
import { PRESETS, TURNS, BRIEF, renderHtml, type Mode } from './artifacts'

const mq = matchMedia('(prefers-color-scheme: dark)')
let pref: 'system' | Mode = 'system'
let view: 'compare' | 'turns' = 'compare'
let turn = 3
let turnPreset = 'vercel'
const mode = (): Mode => pref === 'system' ? (mq.matches ? 'dark' : 'light') : pref
const app = document.querySelector<HTMLDivElement>('#app')!

function render() {
  const m = mode()
  document.documentElement.dataset.theme = m
  const themeBtns = (['system', 'light', 'dark'] as const).map(t => `<button data-theme-pick="${t}" aria-pressed="${pref === t}">${{ system: '跟随系统', light: '浅色', dark: '深色' }[t]}</button>`).join('')
  const compare = `<div class="cmp">${PRESETS.map(p => `<figure><figcaption><b>${p.label}</b><span>${p.note}</span></figcaption><iframe title="${p.label} 渲染结果" srcdoc="${esc(renderHtml(p, m, 1))}"></iframe></figure>`).join('')}</div>`
  const t = TURNS[turn - 1]
  const turns = `<div class="turns"><ol class="strip" aria-label="逐轮版本">${TURNS.map(x => `<li><button data-turn="${x.n}" aria-pressed="${x.n === turn}">第 ${x.n} 轮<small>v${x.n} · ${x.change}</small></button></li>`).join('')}</ol>
    <div class="flow"><div class="chat"><p class="role">提示词 · 第 ${t.n} 轮</p><p class="bubble">${t.prompt}</p><p class="role">fx0 输出</p><p class="out" aria-live="polite">已生成 index.html · 版本 v${t.n}（${t.change}）</p>
    <label>风格 <select id="tp">${PRESETS.map(p => `<option value="${p.id}"${p.id === turnPreset ? ' selected' : ''}>${p.label}</option>`).join('')}</select></label></div>
    <iframe class="big" title="第 ${t.n} 轮预览" srcdoc="${esc(renderHtml(PRESETS.find(p => p.id === turnPreset)!, m, t.n))}"></iframe></div></div>`
  app.innerHTML = `<header class="top"><div><h1>fx0 设计风格对比</h1><p>同一份需求，四种 design.md 风格；外加提示词 → HTML 的逐轮版本。<span class="badge">示例数据 · 未调用模型</span></p></div><div class="themes" role="group" aria-label="主题">${themeBtns}</div></header>
  <p class="brief"><b>产品需求：</b>${BRIEF}</p>
  <nav class="tabs" role="tablist"><button role="tab" data-view="compare" aria-selected="${view === 'compare'}">并排对比</button><button role="tab" data-view="turns" aria-selected="${view === 'turns'}">逐轮版本</button></nav>
  <main>${view === 'compare' ? compare : turns}</main>
  <footer>灵感来自 <a href="https://github.com/vercel-labs/fx0">vercel-labs/fx0</a>（Apache-2.0）· 风格预设来自 <a href="https://github.com/VoltAgent/awesome-design-md">VoltAgent/awesome-design-md</a>（MIT）</footer>`
}
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')

app.addEventListener('click', e => {
  const b = (e.target as HTMLElement).closest('button'); if (!b) return
  if (b.dataset.themePick) pref = b.dataset.themePick as typeof pref
  if (b.dataset.view) view = b.dataset.view as typeof view
  if (b.dataset.turn) turn = +b.dataset.turn
  render()
})
app.addEventListener('change', e => { const s = e.target as HTMLSelectElement; if (s.id === 'tp') { turnPreset = s.value; render() } })
mq.addEventListener('change', () => pref === 'system' && render())
render()
