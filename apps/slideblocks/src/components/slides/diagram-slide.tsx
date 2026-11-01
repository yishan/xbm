// Mermaid source rendered by pele (diagram:mermaid route), as in UniUni2000/slideblocks-skill (MIT).
import type { DiagramSlideData, SlideProps } from "@/lib/deck-types";
import { SlideShell } from "@/components/slides/slide-shell";
import rolesSvg from "../../../diagrams/A12.svg?raw";

export function DiagramSlide({ slide, index, total }: SlideProps<DiagramSlideData>) {
  return (
    <SlideShell index={index} total={total} title={slide.title} kicker="Diagram">
      <div data-testid="slide-diagram" className="grid h-full w-full grid-rows-[minmax(0,1fr)_auto] gap-[24px]">
        <div
          className="sb-pele grid min-h-0 place-items-center rounded-[16px] border border-[color:var(--sb-border)] bg-[var(--sb-card)] p-[28px] shadow-[var(--sb-shadow)]"
          data-slideblocks-asset-id="A12"
          data-slideblocks-render-route="diagram:mermaid"
          role="img"
          aria-label="流程图：人把需求交给主 agent；主 agent 把子任务和验收条件交给研究 agent 和执行 agent；研究 agent 回传资料摘要，执行 agent 回传未合并的 PR；主 agent 把结果和证据交回给人；执行 agent 的敏感动作先问人。"
          dangerouslySetInnerHTML={{ __html: rolesSvg }}
        />
        <div className="flex items-baseline justify-between gap-[24px]">
          <ul className="flex flex-wrap gap-x-[28px] gap-y-[8px] text-[20px] leading-[1.5] text-[color:var(--sb-fg)]">
            {slide.notes.map((n, i) => (
              <li key={`${slide.id}-note-${i}`} className="flex items-baseline gap-[10px]">
                <span className="text-[16px] font-semibold tabular-nums text-[color:var(--sb-accent)]">{String(i + 1).padStart(2, "0")}</span>
                {n}
              </li>
            ))}
          </ul>
          <span className="shrink-0 text-[16px] text-[color:var(--sb-muted)]">{slide.caption}</span>
        </div>
      </div>
    </SlideShell>
  );
}
