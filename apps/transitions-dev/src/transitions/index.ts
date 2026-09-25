import type { TransitionDef } from "./types"
import { NumberPopIn, numberPopInJsx } from "./number-pop-in"
import numberPopInCss from "./number-pop-in.css?raw"
import { Toast, toastJsx } from "./toast"
import toastCss from "./toast.css?raw"
import { TabsSliding, tabsSlidingJsx } from "./tabs-sliding"
import tabsSlidingCss from "./tabs-sliding.css?raw"
import { SkeletonReveal, skeletonRevealJsx } from "./skeleton-reveal"
import skeletonRevealCss from "./skeleton-reveal.css?raw"
import { Tilt3D, tilt3dJsx } from "./tilt-3d"
import tilt3dCss from "./tilt-3d.css?raw"
import { StreamingText, streamingTextJsx } from "./streaming-text"
import streamingTextCss from "./streaming-text.css?raw"
import { IconSwap, iconSwapJsx } from "./icon-swap"
import iconSwapCss from "./icon-swap.css?raw"
import { SuccessCheck, successCheckJsx } from "./success-check"
import successCheckCss from "./success-check.css?raw"
import { ErrorShake, errorShakeJsx } from "./error-shake"
import errorShakeCss from "./error-shake.css?raw"
import { MenuDropdown, menuDropdownJsx } from "./menu-dropdown"
import menuDropdownCss from "./menu-dropdown.css?raw"
import { LikeButton, likeButtonJsx } from "./like-button"
import likeButtonCss from "./like-button.css?raw"
import { ShimmerText, shimmerTextJsx } from "./shimmer-text"
import shimmerTextCss from "./shimmer-text.css?raw"

export const TRANSITIONS: TransitionDef[] = [
  {
    id: "number-pop-in",
    title: "Number pop-in",
    description: "Only the digits that changed rise in, with blur and a stagger.",
    category: "Text",
    action: "Next value",
    Demo: NumberPopIn,
    css: numberPopInCss,
    jsx: numberPopInJsx,
  },
  {
    id: "toast-open-close",
    title: "Toast open/close",
    description: "Rises in with fade, blur and scale; leaves quicker than it came.",
    category: "Essential",
    action: "Toggle toast",
    Demo: Toast,
    css: toastCss,
    jsx: toastJsx,
  },
  {
    id: "tabs-sliding",
    title: "Tabs sliding",
    description: "A pill indicator glides to the active tab with a soft overshoot.",
    category: "Essential",
    action: "Next tab",
    Demo: TabsSliding,
    css: tabsSlidingCss,
    jsx: tabsSlidingJsx,
  },
  {
    id: "skeleton-reveal",
    title: "Skeleton loader & reveal",
    description: "Pulsing placeholder cross-fades into the real content.",
    category: "Essential",
    action: "Reload",
    Demo: SkeletonReveal,
    css: skeletonRevealCss,
    jsx: skeletonRevealJsx,
  },
  {
    id: "3d-tilt",
    title: "3D tilt",
    description: "Card tilts toward the pointer with a moving glare. Hover it.",
    category: "Effect",
    action: "Auto-tilt",
    Demo: Tilt3D,
    css: tilt3dCss,
    jsx: tilt3dJsx,
  },
  {
    id: "streaming-text",
    title: "Streaming text",
    description: "Each new word resolves through a soft blur, like an LLM reply.",
    category: "Text",
    action: "Stream again",
    Demo: StreamingText,
    css: streamingTextCss,
    jsx: streamingTextJsx,
  },
  {
    id: "icon-swap",
    title: "Icon swap",
    description: "Outgoing icon shrinks and blurs as the next one scales in.",
    category: "Essential",
    action: "Swap icons",
    Demo: IconSwap,
    css: iconSwapCss,
    jsx: iconSwapJsx,
  },
  {
    id: "success-check",
    title: "Success check",
    description: "Badge pops in with blur and rotation, then the check draws on.",
    category: "Essential",
    action: "Replay",
    Demo: SuccessCheck,
    css: successCheckCss,
    jsx: successCheckJsx,
  },
  {
    id: "error-state-shake",
    title: "Error state shake",
    description: "Decaying shake on a bad submit, with the message easing open.",
    category: "Essential",
    action: "Submit invalid",
    Demo: ErrorShake,
    css: errorShakeCss,
    jsx: errorShakeJsx,
  },
  {
    id: "menu-dropdown",
    title: "Menu dropdown",
    description: "Origin-aware: each menu scales out of the corner it's anchored to.",
    category: "Essential",
    action: "Open menus",
    Demo: MenuDropdown,
    css: menuDropdownCss,
    jsx: menuDropdownJsx,
  },
  {
    id: "like-button",
    title: "Like button",
    description: "Heart pops and fills while a ring and particles burst out.",
    category: "Effect",
    action: "Toggle like",
    Demo: LikeButton,
    css: likeButtonCss,
    jsx: likeButtonJsx,
  },
  {
    id: "shimmer-text",
    title: "Shimmer text",
    description: "A masked highlight sweeps across agent status lines.",
    category: "Text",
    action: "Next status",
    Demo: ShimmerText,
    css: shimmerTextCss,
    jsx: shimmerTextJsx,
  },
]
