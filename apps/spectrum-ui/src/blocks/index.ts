import type { BlockDef } from "./types"

import { TiltCardDemo } from "@/demos/tilt-card"
import { ToastStackDemo } from "@/demos/toast-stack"
import { BeamSearchDemo } from "@/demos/beam-search"
import { HoldToConfirmDemo } from "@/demos/hold-to-confirm"
import { MetalPromptBarDemo } from "@/demos/metal-prompt-bar"
import { TextStatesDemo } from "@/demos/text-states"
import { UndoPillDemo } from "@/demos/undo-pill"
import { MorphButtonDemo } from "@/demos/morph-button"
import { ExpandableActionBarDemo } from "@/demos/expandable-action-bar"
import { NotificationBellDemo } from "@/demos/notification-bell"
import { SwipeToDeleteDemo } from "@/demos/swipe-to-delete"
import { NumberTickerDemo } from "@/demos/number-ticker"

import tiltCardSource from "./tilt-card.tsx?raw"
import toastStackSource from "./toast-stack.tsx?raw"
import beamSearchSource from "./beam-search.tsx?raw"
import holdToConfirmSource from "./hold-to-confirm.tsx?raw"
import metalPromptBarSource from "./metal-prompt-bar.tsx?raw"
import textStatesSource from "./text-states.tsx?raw"
import undoPillSource from "./undo-pill.tsx?raw"
import morphButtonSource from "./morph-button.tsx?raw"
import expandableActionBarSource from "./expandable-action-bar.tsx?raw"
import notificationBellSource from "./notification-bell.tsx?raw"
import swipeToDeleteSource from "./swipe-to-delete.tsx?raw"
import numberTickerSource from "./number-ticker.tsx?raw"

export const BLOCKS: BlockDef[] = [
  {
    id: "tilt-card",
    title: "3D Tilt Card",
    description:
      "A tactile agent profile card that follows your pointer with layered depth and a glare highlight.",
    hint: "Move your pointer over the card",
    category: "Surface",
    file: "tilt-card.tsx",
    Demo: TiltCardDemo,
    source: tiltCardSource,
  },
  {
    id: "toast-stack",
    title: "Toast Stack",
    description:
      "A stack of layered agent notifications that you can swipe away like email.",
    hint: "Hover the stack, drag a toast sideways",
    category: "Feedback",
    file: "toast-stack.tsx",
    Demo: ToastStackDemo,
    source: toastStackSource,
  },
  {
    id: "beam-search",
    title: "Beam Search Input",
    description:
      "A search field with a sweeping beam scan and chip suggestions.",
    hint: "Focus the input",
    category: "Agent",
    file: "beam-search.tsx",
    Demo: BeamSearchDemo,
    source: beamSearchSource,
  },
  {
    id: "hold-to-confirm",
    title: "Hold to Confirm",
    description:
      "Press and hold the agent action button until the ring completes to confirm.",
    hint: "Press and hold the button",
    category: "Input",
    file: "hold-to-confirm.tsx",
    Demo: HoldToConfirmDemo,
    source: holdToConfirmSource,
  },
  {
    id: "metal-prompt-bar",
    title: "Metal Prompt Bar",
    description:
      "A brushed-metal prompt input with a glowing focus and send button.",
    hint: "Focus the prompt and type",
    category: "Agent",
    file: "metal-prompt-bar.tsx",
    Demo: MetalPromptBarDemo,
    source: metalPromptBarSource,
  },
  {
    id: "text-states",
    title: "Text States",
    description:
      "Animated text states that cycle through agent thinking, searching, and writing.",
    hint: "Watch the states cycle",
    category: "Agent",
    file: "text-states.tsx",
    Demo: TextStatesDemo,
    source: textStatesSource,
  },
  {
    id: "undo-pill",
    title: "Undo Pill",
    description:
      "A pill notification that lets users undo the last archive action.",
    hint: "Click Archive to reveal Undo",
    category: "Feedback",
    file: "undo-pill.tsx",
    Demo: UndoPillDemo,
    source: undoPillSource,
  },
  {
    id: "morph-button",
    title: "Morph Button",
    description:
      "A button that morphs through loading, success, and failure states.",
    hint: "Click the button and watch it morph",
    category: "Feedback",
    file: "morph-button.tsx",
    Demo: MorphButtonDemo,
    source: morphButtonSource,
  },
  {
    id: "expandable-action-bar",
    title: "Expandable Action Bar",
    description:
      "A compact action bar that expands on click to reveal more options.",
    hint: "Click the action bar to expand",
    category: "Input",
    file: "expandable-action-bar.tsx",
    Demo: ExpandableActionBarDemo,
    source: expandableActionBarSource,
  },
  {
    id: "notification-bell",
    title: "Notification Bell",
    description:
      "A bell that rings with new agent alerts and marks them read.",
    hint: "Click the bell or add new alerts",
    category: "Feedback",
    file: "notification-bell.tsx",
    Demo: NotificationBellDemo,
    source: notificationBellSource,
  },
  {
    id: "swipe-to-delete",
    title: "Swipe to Delete",
    description:
      "Swipe an agent thread horizontally to delete it with a spring transition.",
    hint: "Swipe a row left",
    category: "Input",
    file: "swipe-to-delete.tsx",
    Demo: SwipeToDeleteDemo,
    source: swipeToDeleteSource,
  },
  {
    id: "number-ticker",
    title: "Number Ticker",
    description:
      "A rolling digit counter that animates as agent progress metrics update.",
    hint: "Click to add a batch and bump the number",
    category: "Surface",
    file: "number-ticker.tsx",
    Demo: NumberTickerDemo,
    source: numberTickerSource,
  },
]
