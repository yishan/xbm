import { useState } from "react";
import { FileInput } from "@/blocks/file-input";

export function FileInputDemo() {
  const [injectFiles, setInjectFiles] = useState<File[]>([]);

  const useSampleFiles = () => {
    setInjectFiles([
      new File(["hello"], "moodboard.png", { type: "image/png" }),
      new File([new Uint8Array(48 * 1024)], "brief.pdf", { type: "application/pdf" }),
    ]);
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 pt-8 pb-3">
      <FileInput className="w-full max-w-[300px]" injectFiles={injectFiles} />
      <button
        type="button"
        onClick={useSampleFiles}
        data-testid="file-sample"
        className="text-xs font-medium text-zinc-400 underline-offset-4 transition-colors hover:text-zinc-200 hover:underline"
      >
        Use sample files
      </button>
    </div>
  );
}
