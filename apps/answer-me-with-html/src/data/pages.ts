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
    title: 'xbm nightly demo pipeline',
    summary: '19:55 pick → approval → 22:00 build → 05:53 report, plus the manual start when approval is late.',
    components: ['sequence', 'flow', 'callout', 'table'],
    source: 'xbm AGENTS.md + 2026-10-08 pick/status notes',
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
    title: 'Nightly build procedure (ASD-STE100)',
    summary: 'The build steps written in STE100 style and rendered with style: strict.',
    components: ['list', 'callout', 'table'],
    source: 'xbm AGENTS.md, STE rules from upstream',
  },
]

export const pageUrl = (id: string) => `${import.meta.env.BASE_URL}pages/${id}.html`
export const draftUrl = (id: string) => `${import.meta.env.BASE_URL}drafts/${id}.md`

export const UPSTREAM = 'https://github.com/QingYunA/answer-me-with-html'
export const BENCH_URL = 'https://github.com/QingYunA/answer-me-with-html#why-not-just-ask-for-html'
