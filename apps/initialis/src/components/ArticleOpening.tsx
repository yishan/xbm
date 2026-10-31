import { useState } from "react";
import type { CSSProperties } from "react";
import { CapCanvas } from "@/components/CapCanvas";
import type { CapSettings } from "@/lib/initialis";

type ArticleOpeningProps = {
  settings: CapSettings;
  replayKey: number;
  letter: string;
};

const MOBY_DICK =
  "t is a way I have of driving off the spleen, and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people's hats off—then, I account it high time to get to sea as soon as I can.";

const STARTERS: Record<string, string> = {
  A: "And",
  B: "By",
  C: "Call",
  D: "Down",
  E: "Each",
  F: "Far",
  G: "Go",
  H: "Here",
  I: "In",
  J: "Just",
  K: "Keep",
  L: "Let",
  M: "Many",
  N: "Never",
  O: "Once",
  P: "Past",
  Q: "Quietly",
  R: "Read",
  S: "So",
  T: "Then",
  U: "Under",
  V: "Very",
  W: "When",
  X: "Xenial",
  Y: "You",
  Z: "Zealous",
};

const GENERIC_CONTINUATION =
  "the harbour lay still beneath a pale morning sky, and the small boats knocked softly against their moorings. A woman swept the steps of the custom house, a boy carried a covered basket along the quay, and gulls turned above the water as if reading the wind. Nothing in the town had changed, yet every doorway seemed to hold a different story, and every window a different light. By noon the market would fill with voices, and by evening the same streets would empty again, leaving only the smell of salt and rope behind.";

const SECOND_PARAGRAPH =
  "There was no hurry in the town that morning. The tide kept its own counsel, the clock above the market moved as clocks do, and the road out of town waited for whoever might take it. Whoever passed would be greeted by the same salt wind and the same low line of hills, and would carry away a memory too small to name but too clear to lose.";

export function ArticleOpening({ settings, replayKey, letter }: ArticleOpeningProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  const initial = letter.trim().toUpperCase();
  const firstText =
    initial === "I"
      ? MOBY_DICK
      : `${(STARTERS[initial] ?? "And").slice(1)} ${GENERIC_CONTINUATION}`;

  const wrapperStyle: CSSProperties = {
    width: 132,
    height: 132,
    ...(dataUrl
      ? {
          shapeOutside: `url("${dataUrl}")`,
          shapeMargin: "12px",
          shapeImageThreshold: 0.2,
        }
      : {}),
  };

  return (
    <article className="mx-auto max-w-[60ch] font-serif text-[18px] leading-[1.6]">
      <p className="mb-4 font-sans text-[12px] tracking-[0.04em] text-muted-foreground">示例数据</p>
        <div className="float-left mr-3 mt-1" style={wrapperStyle}>
          <CapCanvas
            settings={settings}
            size={132}
            animate={true}
            replayKey={replayKey}
            label={`首字母 ${initial || letter}`}
            onDrawn={(url) => setDataUrl(url)}
          />
        </div>
      <p className="text-pretty">
        {firstText}
      </p>
      <p className="mt-5 text-pretty">{SECOND_PARAGRAPH}</p>
    </article>
  );
}
