export type ThemeId = 'blueprint' | 'shadcn' | 'paper'
export type ModeId = 'light' | 'dark'

export const THEMES: { id: ThemeId; label: string }[] = [
  { id: 'blueprint', label: 'Blueprint' },
  { id: 'shadcn', label: 'Card (shadcn)' },
  { id: 'paper', label: 'Long-read (paper)' },
]

export type DemoPage = {
  id: string // file stem: public/pages/<id>.html and public/drafts/<id>.md
  title: string
  summary: string
  components: string[] // am components used
  source: string // where the facts come from
  exampleData?: boolean
}

export const PAGES: DemoPage[] = [
  {
    id: '01-nightly-pipeline',
    title: 'xbm demo pipeline',
    summary: '挑选 → 审批 → 构建 → 开 PR, plus the manual start when approval is late.',
    components: ['sequence', 'flow', 'callout', 'table'],
    source: 'xbm AGENTS.md (generic flow)',
  },
  {
    id: '02-vercel-vs-worker',
    title: 'Vercel frontend vs Cloudflare Worker backend',
    summary: 'The standing backend rule from AGENTS.md as one comparison table and a decision flow.',
    components: ['table', 'flow', 'kv', 'callout'],
    source: 'xbm AGENTS.md (Backends standing rule)',
  },
  {
    id: '03-gallery-timeline',
    title: 'xbm gallery timeline',
    summary: '11 demos live since 2026-09-24, from the first-parent merge log.',
    components: ['timeline', 'table', 'kv', 'callout'],
    source: 'git log --merges --first-parent origin/main (ce5fd1d)',
  },
  {
    id: '04-tcp-reference',
    title: 'TCP three-way handshake (upstream example)',
    summary: 'Upstream examples/tcp.en.md, unchanged, as the reference rendering.',
    components: ['sequence', 'flow', 'callout', 'table'],
    source: 'QingYunA/answer-me-with-html examples/tcp.en.md (RFC 9293)',
  },
  {
    id: '05-ste100-nightly',
    title: 'Demo build procedure (ASD-STE100)',
    summary: 'The build steps written in STE100 style and rendered with style: strict.',
    components: ['list', 'callout', 'table'],
    source: 'xbm AGENTS.md, STE rules from upstream',
  },
  {
    id: '06-er-requirement-change',
    title: '需求变更的数据模型（er · v0.5）',
    summary: 'A product-requirement schema change drawn with the new er component; switch Before / Changes / After under the diagram.',
    components: ['er', 'callout', 'table', 'ask'],
    source: '示例数据 (a made-up task app)',
    exampleData: true,
  },
  {
    id: '07-remark-feedback',
    title: '用「标注」把意见发回给 Agent（Remark · v0.5）',
    summary: 'Turn on 标注, mark blocks as 建议 / 保留 / 疑问 / 关注, add a note, and copy them back to the agent in the Reply.',
    components: ['remark', 'callout', 'table', 'list'],
    source: '示例数据 (a made-up release note draft)',
    exampleData: true,
  },
]

export const pageUrl = (id: string) => `${import.meta.env.BASE_URL}pages/${id}.html`
export const draftUrl = (id: string) => `${import.meta.env.BASE_URL}drafts/${id}.md`

export const UPSTREAM = 'https://github.com/QingYunA/answer-me-with-html'
export const BENCH_URL = 'https://github.com/QingYunA/answer-me-with-html#why-not-just-ask-for-html'
