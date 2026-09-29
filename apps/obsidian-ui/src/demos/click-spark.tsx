import { useState } from "react";
import { useReducedMotionConfig } from "motion/react";
import { Zap } from "lucide-react";
import { ClickSpark } from "@/blocks/click-spark";

const SPARK_COLORS = ["#a78bfa", "#38bdf8", "#f472b6", "#fbbf24"];

export function ClickSparkDemo() {
  const reducedMotion = useReducedMotionConfig() ?? false;
  const [sparkCount, setSparkCount] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);

  const handleSpark = () => {
    setSparkCount((count) => count + 1);
    setColorIndex((index) => (index + 1) % SPARK_COLORS.length);
  };

  return (
    <div data-testid="spark-area" className="h-full w-full">
      <ClickSpark
        className="h-full w-full"
        sparkColor={SPARK_COLORS[colorIndex]}
        sparkSize={16}
        sparkRadius={28}
        onSpark={handleSpark}
        reducedMotion={reducedMotion}
      >
        <div className="flex h-full w-full flex-col items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Spark"
            data-testid="spark-button"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 border border-white/10 p-0"
          >
            <Zap />
          </button>
          <p className="text-sm text-zinc-400">Click anywhere</p>
          <p className="text-xs text-zinc-500">{sparkCount} {sparkCount === 1 ? "spark" : "sparks"}</p>
        </div>
      </ClickSpark>
    </div>
  );
}
