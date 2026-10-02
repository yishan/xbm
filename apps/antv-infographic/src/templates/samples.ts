import type { TemplateSample } from "./types"

export const SAMPLES: TemplateSample[] = [
  {
    id: "list-row-horizontal-icon-arrow",
    name: "Horizontal Icon Arrow",
    category: "list",
    description: "Step-style row with icons and arrows — classic process strip.",
    syntax: `infographic list-row-horizontal-icon-arrow
data
  title Product Launch Flow
  desc From idea to shipping in four beats
  lists
    - label Discover
      desc Research users
      icon search
    - label Design
      desc Wireframes & UI
      icon pen
    - label Build
      desc Ship MVP
      icon code
    - label Grow
      desc Measure & iterate
      icon chart line
theme
  palette #3b82f6 #8b5cf6 #f97316 #10b981`,
  },
  {
    id: "list-grid-badge-card",
    name: "Grid Badge Cards",
    category: "list",
    description: "Badge cards in a clean grid — great for feature highlights.",
    syntax: `infographic list-grid-badge-card
data
  title Platform Capabilities
  desc What the gallery demo showcases
  lists
    - label Fast SVG
      desc Crisp vector output
      icon flash
    - label 200 Templates
      desc Built-in layouts
      icon layout grid
    - label Themes
      desc Palettes & stylize
      icon palette
    - label AI Friendly
      desc Streamable DSL
      icon sparkles
    - label Editable
      desc Optional editor
      icon edit
    - label Export
      desc SVG / data URL
      icon download
theme
  palette #6366f1 #06b6d4 #f59e0b #ec4899 #14b8a6 #8b5cf6`,
  },
  {
    id: "list-grid-candy-card-lite",
    name: "Candy Card Lite",
    category: "list",
    description: "Soft candy cards — playful feature tiles.",
    syntax: `infographic list-grid-candy-card-lite
data
  title Why Infographics
  lists
    - label Clarity
      desc Compress complex ideas
      icon eye
    - label Memory
      desc Visuals stick longer
      icon brain
    - label Share
      desc Easy to embed
      icon share
    - label Speed
      desc Minutes not hours
      icon rocket
theme
  palette #f472b6 #60a5fa #34d399 #fbbf24`,
  },
  {
    id: "list-zigzag-up-compact-card",
    name: "Zigzag Compact Cards",
    category: "list",
    description: "Ascending zigzag of compact cards for narrative lists.",
    syntax: `infographic list-zigzag-up-compact-card
data
  title Growth Playbook
  lists
    - label Listen
      desc Collect feedback weekly
      icon headphones
    - label Prioritize
      desc Rank by impact
      icon list check
    - label Experiment
      desc Ship small bets
      icon flask
    - label Scale
      desc Double down on winners
      icon trending up
theme
  palette #0ea5e9 #22c55e #a855f7 #f97316`,
  },
  {
    id: "sequence-ascending-steps",
    name: "Ascending Steps",
    category: "sequence",
    description: "Ordered steps climbing upward — release or onboarding.",
    syntax: `infographic sequence-ascending-steps
data
  title Release Pipeline
  sequences
    - label Spec
      desc Align on scope
      icon clipboard
    - label Implement
      desc Code + tests
      icon code
    - label Review
      desc PR & QA
      icon eye check
    - label Deploy
      desc Ship to prod
      icon rocket
  order asc
theme
  palette #4f46e5 #06b6d4 #10b981 #f59e0b`,
  },
  {
    id: "sequence-snake-steps-compact-card",
    name: "Snake Steps",
    category: "sequence",
    description: "Snake-layout process with compact cards.",
    syntax: `infographic sequence-snake-steps-compact-card
data
  title Customer Journey
  sequences
    - label Aware
      icon megaphone
    - label Consider
      icon search
    - label Try
      icon play
    - label Buy
      icon shopping cart
    - label Advocate
      icon heart
theme
  palette #2563eb #7c3aed #db2777 #ea580c #16a34a`,
  },
  {
    id: "sequence-timeline-rounded-rect-node",
    name: "Timeline Nodes",
    category: "sequence",
    description: "Rounded timeline nodes for milestones.",
    syntax: `infographic sequence-timeline-rounded-rect-node
data
  title 2026 Roadmap
  sequences
    - label Q1
      desc Gallery foundation
      icon calendar
    - label Q2
      desc Theme playground
      icon palette
    - label Q3
      desc AI syntax assist
      icon sparkles
    - label Q4
      desc Export kits
      icon package
theme
  palette #3b82f6 #8b5cf6 #ec4899 #14b8a6`,
  },
  {
    id: "sequence-funnel-simple",
    name: "Funnel",
    category: "sequence",
    description: "Simple conversion funnel.",
    syntax: `infographic sequence-funnel-simple
data
  title Signup Funnel
  sequences
    - label Visits
      value 10000
      icon users
    - label Signups
      value 2400
      icon user plus
    - label Activated
      value 1200
      icon check
    - label Paid
      value 360
      icon credit card
theme
  palette #6366f1 #818cf8 #a5b4fc #c7d2fe`,
  },
  {
    id: "hierarchy-tree-curved-line-rounded-rect-node",
    name: "Org Tree",
    category: "hierarchy",
    description: "Curved-line org / structure tree.",
    syntax: `infographic hierarchy-tree-curved-line-rounded-rect-node
data
  title Team Structure
  root
    label Platform
    icon building
    children
      - label Product
        icon box
        children
          - label Design
            icon pen
          - label Research
            icon search
      - label Engineering
        icon code
        children
          - label Frontend
            icon layout
          - label Backend
            icon server
      - label Growth
        icon trending up
theme
  palette #0f766e #0ea5e9 #8b5cf6 #f59e0b`,
  },
  {
    id: "hierarchy-mindmap-branch-gradient-capsule-item",
    name: "Mindmap Capsules",
    category: "hierarchy",
    description: "Gradient capsule mindmap branches.",
    syntax: `infographic hierarchy-mindmap-branch-gradient-capsule-item
data
  title Demo Ideas
  root
    label AntV Gallery
    children
      - label Lists
      - label Sequences
      - label Trees
      - label Compare
      - label Charts
theme
  palette #4f46e5 #06b6d4 #f43f5e #84cc16 #f59e0b`,
  },
  {
    id: "compare-swot",
    name: "SWOT",
    category: "compare",
    description: "Classic SWOT four-quadrant strategy map.",
    syntax: `infographic compare-swot
data
  title Product SWOT
  compares
    - label Strengths
      icon trophy
      children
        - label SVG quality
          icon star
        - label Template depth
          icon layers
    - label Weaknesses
      icon alert
      children
        - label Bundle size
          icon package
        - label Docs language mix
          icon book
    - label Opportunities
      icon rocket
      children
        - label AI streaming
          icon sparkles
        - label React wrappers
          icon code
    - label Threats
      icon shield
      children
        - label Chart clones
          icon copy
theme
  palette #22c55e #ef4444 #3b82f6 #f59e0b`,
  },
  {
    id: "compare-quadrant-quarter-simple-card",
    name: "Priority Quadrant",
    category: "compare",
    description: "2×2 priority matrix with simple cards.",
    syntax: `infographic compare-quadrant-quarter-simple-card
data
  title Task Priority
  compares
    - label Do first
      desc High value · low cost
      icon check
    - label Plan
      desc High value · high cost
      icon calendar
    - label Delegate
      desc Low value · low cost
      icon users
    - label Drop
      desc Low value · high cost
      icon x
theme
  palette #16a34a #2563eb #a3a3a3 #ef4444`,
  },
  {
    id: "compare-binary-horizontal-simple-fold",
    name: "Binary Compare",
    category: "compare",
    description: "Side-by-side binary comparison fold.",
    syntax: `infographic compare-binary-horizontal-simple-fold
data
  title Pricing Snapshot
  compares
    - label Starter
      icon tag
      children
        - label Price
          value 19
          desc USD / mo
          icon coin
        - label Seats
          value 3
          icon users
    - label Pro
      icon crown
      children
        - label Price
          value 49
          desc USD / mo
          icon coin
        - label Seats
          value 15
          icon users
theme
  palette #64748b #4f46e5`,
  },
  {
    id: "chart-column-simple",
    name: "Column Chart",
    category: "chart",
    description: "Simple column chart with values.",
    syntax: `infographic chart-column-simple
data
  title Weekly Active Users
  desc Demo sample data
  values
    - label Mon
      value 120
    - label Tue
      value 180
    - label Wed
      value 150
    - label Thu
      value 220
    - label Fri
      value 260
theme
  palette #6366f1 #818cf8`,
  },
  {
    id: "chart-pie-donut-pill-badge",
    name: "Donut Pills",
    category: "chart",
    description: "Donut chart with pill badges.",
    syntax: `infographic chart-pie-donut-pill-badge
data
  title Traffic Mix
  values
    - label Organic
      value 42
    - label Direct
      value 28
    - label Referral
      value 18
    - label Paid
      value 12
theme
  palette #3b82f6 #8b5cf6 #f97316 #10b981`,
  },
  {
    id: "relation-dagre-flow-tb-badge-card",
    name: "Flow Diagram",
    category: "relation",
    description: "Top-down flow with badge cards and edges.",
    syntax: `infographic relation-dagre-flow-tb-badge-card
data
  title Request Path
  nodes
    - id client
      label Client
      icon monitor
    - id api
      label API
      icon server
    - id db
      label Database
      icon database
    - id cache
      label Cache
      icon zap
  relations
    client - HTTP -> api
    api - query -> db
    api - read -> cache
    db - write-through -> cache
theme
  palette #0ea5e9 #6366f1 #14b8a6 #f59e0b`,
  },
]

export const CATEGORIES: { id: TemplateSample["category"]; label: string }[] = [
  { id: "list", label: "List" },
  { id: "sequence", label: "Sequence" },
  { id: "hierarchy", label: "Hierarchy" },
  { id: "compare", label: "Compare" },
  { id: "chart", label: "Chart" },
  { id: "relation", label: "Relation" },
]

export function getSampleById(id: string): TemplateSample | undefined {
  return SAMPLES.find((s) => s.id === id)
}
