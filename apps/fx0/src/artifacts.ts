export type Mode = 'light' | 'dark'
export interface Preset { id: string; label: string; note: string; font: string; radius: string; weight: number
  light: { bg: string; fg: string; mute: string; card: string; line: string; primary: string; onPrimary: string }
  dark: { bg: string; fg: string; mute: string; card: string; line: string; primary: string; onPrimary: string } }

export const PRESETS: Preset[] = [
  { id: 'vercel', label: 'vercel.md', note: '黑白极简、细线分隔、几何无衬线', font: "'Geist','Inter',system-ui,sans-serif", radius: '6px', weight: 600,
    light: { bg: '#ffffff', fg: '#171717', mute: '#666666', card: '#fafafa', line: '#ebebeb', primary: '#171717', onPrimary: '#ffffff' },
    dark: { bg: '#0a0a0a', fg: '#ededed', mute: '#a1a1a1', card: '#111111', line: '#262626', primary: '#ededed', onPrimary: '#0a0a0a' } },
  { id: 'stripe', label: 'stripe.md', note: '深海军蓝 + 电光靛蓝、细字重标题', font: "'Sohne','Inter',system-ui,sans-serif", radius: '4px', weight: 300,
    light: { bg: '#f6f9fc', fg: '#0d253d', mute: '#64748d', card: '#ffffff', line: '#e3e8ee', primary: '#533afd', onPrimary: '#ffffff' },
    dark: { bg: '#0d1530', fg: '#e8ecf5', mute: '#9aa7c0', card: '#1c1e54', line: '#2e2b8c', primary: '#665efd', onPrimary: '#ffffff' } },
  { id: 'airbnb', label: 'airbnb.md', note: '暖珊瑚红、大圆角、友好排版', font: "'Circular','Inter',system-ui,sans-serif", radius: '16px', weight: 700,
    light: { bg: '#ffffff', fg: '#222222', mute: '#6a6a6a', card: '#f7f7f7', line: '#dddddd', primary: '#ff385c', onPrimary: '#ffffff' },
    dark: { bg: '#18181a', fg: '#f2f2f2', mute: '#b0b0b0', card: '#232326', line: '#3a3a3d', primary: '#ff385c', onPrimary: '#ffffff' } },
  { id: 'apple', label: 'apple.md', note: '大留白、系统字体、蓝色链接式按钮', font: "-apple-system,'SF Pro Display',system-ui,sans-serif", radius: '980px', weight: 600,
    light: { bg: '#f5f5f7', fg: '#1d1d1f', mute: '#6e6e73', card: '#ffffff', line: '#d2d2d7', primary: '#0071e3', onPrimary: '#ffffff' },
    dark: { bg: '#000000', fg: '#f5f5f7', mute: '#a1a1a6', card: '#1c1c1e', line: '#38383a', primary: '#2997ff', onPrimary: '#ffffff' } },
]

export const BRIEF = '为「Pulse 笔记」做一个定价页：三个套餐（免费 / 专业 / 团队），突出专业版，配一句标语和行动按钮。'
export const TURNS = [
  { n: 1, prompt: BRIEF, change: '初版：标题 + 三个套餐卡片' },
  { n: 2, prompt: '加一个「月付 / 年付」切换，年付显示省 20%。', change: '新增计费周期切换与优惠标签' },
  { n: 3, prompt: '底部加三条常见问题，联系邮箱用 ada@studio.dev。', change: '新增常见问题与联系邮箱' },
]

const PLANS = [
  { name: '免费', m: 0, feats: ['3 个笔记本', '基础同步', '社区支持'] },
  { name: '专业', m: 48, feats: ['无限笔记本', 'AI 摘要', '版本历史 30 天'], hot: true },
  { name: '团队', m: 98, feats: ['共享空间', '权限管理', '优先支持'] },
]

/** Pre-generated single-file HTML, as fx0 would emit for a given preset + turn. */
export function renderHtml(p: Preset, mode: Mode, turn: number): string {
  const c = p[mode]; const yearly = turn >= 2
  const price = (m: number) => m === 0 ? '¥0' : `¥${yearly ? Math.round(m * 0.8) : m}`
  const cards = PLANS.map(pl => `<div class="card${pl.hot ? ' hot' : ''}">${pl.hot ? '<span class="tag">最受欢迎</span>' : ''}<h3>${pl.name}</h3><p class="price">${price(pl.m)}<small>/月</small></p><ul>${pl.feats.map(f => `<li>${f}</li>`).join('')}</ul><a class="btn${pl.hot ? '' : ' ghost'}">${pl.m ? '开始试用' : '免费使用'}</a></div>`).join('')
  const toggle = yearly ? `<div class="tg"><span>月付</span><span class="on">年付 <b>省 20%</b></span></div>` : ''
  const faq = turn >= 3 ? `<section class="faq"><h2>常见问题</h2><details open><summary>可以随时取消吗？</summary><p>可以，取消后保留到当期结束。</p></details><details><summary>支持发票吗？</summary><p>专业版与团队版支持。</p></details><details><summary>如何联系我们？</summary><p>写信到 ada@studio.dev。</p></details></section>` : ''
  return `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box}body{margin:0;font-family:${p.font};background:${c.bg};color:${c.fg};padding:28px 22px}
header{text-align:center;margin-bottom:20px}h1{font-weight:${p.weight};font-size:26px;margin:0 0 6px;letter-spacing:-.02em}header p{color:${c.mute};margin:0;font-size:13px}
.tg{display:flex;justify-content:center;gap:4px;margin:0 auto 18px;font-size:12px;border:1px solid ${c.line};border-radius:${p.radius};padding:3px;width:max-content}.tg span{padding:4px 10px;border-radius:${p.radius};color:${c.mute}}.tg .on{background:${c.primary};color:${c.onPrimary}}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.card{position:relative;background:${c.card};border:1px solid ${c.line};border-radius:${p.radius === '980px' ? '18px' : p.radius};padding:16px 14px}
.hot{border-color:${c.primary};box-shadow:0 0 0 1px ${c.primary}}.tag{position:absolute;top:-9px;left:12px;font-size:10px;background:${c.primary};color:${c.onPrimary};padding:2px 8px;border-radius:${p.radius}}
h3{margin:0;font-size:14px;font-weight:${p.weight}}.price{font-size:24px;font-weight:${p.weight};margin:8px 0}.price small{font-size:11px;color:${c.mute}}
ul{padding:0;margin:0 0 14px;list-style:none;font-size:12px;color:${c.mute}}li{padding:3px 0;border-top:1px solid ${c.line}}
.btn{display:block;text-align:center;font-size:12px;padding:8px;border-radius:${p.radius};background:${c.primary};color:${c.onPrimary}}.ghost{background:transparent;color:${c.fg};border:1px solid ${c.line}}
.faq{margin-top:22px}.faq h2{font-size:16px;font-weight:${p.weight}}details{border-top:1px solid ${c.line};padding:8px 0;font-size:12px}summary{cursor:pointer}details p{color:${c.mute};margin:6px 0 0}
</style></head><body><header><h1>Pulse 笔记，想法随时成形</h1><p>选择适合你的套餐 · 示例数据</p></header>${toggle}<div class="grid">${cards}</div>${faq}</body></html>`
}
