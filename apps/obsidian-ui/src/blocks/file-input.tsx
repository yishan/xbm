// File Input — Upload dropzone that morphs between idle, drag, uploading, and done states.
// Inspired by ObsidianUI (obsidianui.dev, MIT). Re-implemented from scratch.

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { motion, AnimatePresence, useReducedMotionConfig } from "motion/react";
import { Check, FileText, Image as ImageIcon, Loader2, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadItem = {
  id: string;
  file: File;
  progress: number;
};

type FileItem = {
  id: string;
  file: File;
};

export type FileInputProps = {
  accept?: string;
  maxSizeInMB?: number;
  onFilesChange?: (files: File[]) => void;
  className?: string;
  injectFiles?: File[];
};

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileInput({
  accept,
  maxSizeInMB = 5,
  onFilesChange,
  className,
  injectFiles,
}: FileInputProps) {
  const reducedMotion = useReducedMotionConfig() ?? false;
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState<UploadItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const addFilesRef = useRef<(incoming: File[] | FileList) => void>(() => {});
  const uploadingRef = useRef<UploadItem[]>(uploading);

  const maxBytes = maxSizeInMB * 1024 * 1024;

  uploadingRef.current = uploading;

  const addFiles = (incoming: File[] | FileList) => {
    if (uploading.length > 0) return;

    const files = Array.from(incoming);
    const valid: File[] = [];
    const invalid: File[] = [];

    for (const file of files) {
      if (file.size > maxBytes) {
        invalid.push(file);
      } else {
        valid.push(file);
      }
    }

    if (invalid.length > 0) {
      setError(
        invalid.length === 1
          ? `${invalid[0].name} exceeds the ${maxSizeInMB} MB limit.`
          : `Some files exceed the ${maxSizeInMB} MB limit.`
      );
    } else {
      setError(null);
    }

    if (valid.length > 0) {
      const uploadItems: UploadItem[] = valid.map((file) => ({
        id: makeId(),
        file,
        progress: 0,
      }));

      setUploading((prev) => [...prev, ...uploadItems]);
      onFilesChange?.(valid);
    }
  };

  addFilesRef.current = addFiles;

  useEffect(() => {
    if (injectFiles && injectFiles.length > 0) {
      addFilesRef.current(injectFiles);
    }
  }, [injectFiles]);

  useEffect(() => {
    if (uploading.length === 0) return;

    const start = performance.now();
    const duration = reducedMotion ? 0 : 1200;
    let rafId = 0;

    const tick = (now: number) => {
      const progress = reducedMotion
        ? 100
        : Math.min(100, ((now - start) / duration) * 100);

      setUploading((prev) => prev.map((item) => ({ ...item, progress })));

      if (progress >= 100) {
        const completedItems = uploadingRef.current.map((item) => ({
          id: item.id,
          file: item.file,
        }));

        setCompleted((prev) => [...prev, ...completedItems]);
        setUploading([]);
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [uploading.length, reducedMotion]);

  const openPicker = () => {
    if (uploading.length === 0) {
      inputRef.current?.click();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) addFiles(files);
    e.target.value = "";
  };

  const phase: "idle" | "dragover" | "uploading" | "done" =
    uploading.length > 0 ? "uploading" : dragOver ? "dragover" : completed.length > 0 ? "done" : "idle";

  const visibleFiles = completed.slice(0, 3);
  const remainingCount = completed.length - visibleFiles.length;

  return (
    <div className={cn("relative", className)}>
      <div
        className="relative"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target) setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {phase === "idle" && (
            <motion.div
              key="idle"
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
              className="flex h-[170px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-zinc-950/50 px-4 text-center cursor-pointer transition-colors hover:border-white/25"
              role="button"
              tabIndex={0}
              onClick={openPicker}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openPicker();
                }
              }}
              data-testid="file-dropzone"
            >
              <motion.div
                animate={{ y: 0, scale: 1 }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
                className="rounded-xl border border-white/10 bg-zinc-900 p-3"
              >
                <UploadCloud className="h-5 w-5 text-zinc-300" />
              </motion.div>
              <p className="mt-3 text-sm font-medium text-zinc-100">Drop files here</p>
              <p className="mt-1 text-xs text-zinc-500">or click to browse · max {maxSizeInMB} MB</p>
            </motion.div>
          )}

          {phase === "dragover" && (
            <motion.div
              key="dragover"
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
              className="flex h-[170px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-violet-400/60 bg-violet-500/5 px-4 text-center"
            >
              <motion.div
                animate={{ y: -4, scale: 1.08 }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
                className="rounded-xl border border-violet-400/30 bg-violet-500/10 p-3"
              >
                <UploadCloud className="h-5 w-5 text-violet-300" />
              </motion.div>
              <p className="mt-3 text-sm font-medium text-zinc-100">Release to upload</p>
            </motion.div>
          )}

          {phase === "uploading" && (
            <motion.div
              key="uploading"
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
              className="flex w-full flex-col gap-2 rounded-2xl border border-white/10 bg-zinc-950/70 p-3"
            >
              {uploading.map((item) => (
                <motion.div key={item.id} layout>
                  <div className="flex items-center gap-2">
                    <Loader2 className={cn("h-4 w-4 text-zinc-400", reducedMotion ? "" : "animate-spin")} />
                    <p className="min-w-0 flex-1 truncate text-sm text-zinc-200">{item.file.name}</p>
                    <span className="text-xs text-zinc-500">{Math.round(item.progress)}%</span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-400"
                      initial={{ width: "0%" }}
                      animate={{ width: `${item.progress}%` }}
                      transition={{ duration: reducedMotion ? 0 : 0.15, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {phase === "done" && (
            <motion.div
              key="done"
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
              className="flex w-full flex-col gap-2 rounded-2xl border border-white/10 bg-zinc-950/70 p-3"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: reducedMotion ? "tween" : "spring", stiffness: 300, damping: 20 }}
                className="flex items-center gap-1.5 text-xs font-medium text-emerald-400"
              >
                <Check className="h-4 w-4" />
                Upload complete
              </motion.div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <AnimatePresence initial={false}>
                  {visibleFiles.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: reducedMotion ? 0 : 0.15 }}
                      className="flex max-w-[180px] items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900 px-2 py-1"
                    >
                      {item.file.type.startsWith("image/") ? (
                        <ImageIcon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                      ) : (
                        <FileText className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                      )}
                      <span className="min-w-0 flex-1 truncate text-xs text-zinc-200">{item.file.name}</span>
                      <span className="text-[10px] text-zinc-500">{formatBytes(item.file.size)}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${item.file.name}`}
                        onClick={() => setCompleted((prev) => prev.filter((f) => f.id !== item.id))}
                        className="ml-0.5 text-zinc-500 transition-colors hover:text-zinc-200"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {remainingCount > 0 && (
                  <span className="text-xs text-zinc-500">+{remainingCount} more</span>
                )}
              </div>
              <button
                type="button"
                onClick={openPicker}
                className="text-left text-xs font-medium text-violet-400 transition-colors hover:text-violet-300"
              >
                Add more
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleInputChange}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      {error && (
        <motion.p
          key={error}
          initial={{ x: 0 }}
          animate={{ x: [0, -4, 4, -4, 4, 0] }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}
          className="mt-2 text-xs font-medium text-rose-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
