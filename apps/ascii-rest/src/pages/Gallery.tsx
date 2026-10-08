import { useMemo, useState } from "react";
import type { Category, FpsChoice } from "@/lib/types";
import { PIECES, CATEGORIES } from "@/lib/types";
import { useTheme } from "@/lib/theme";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { GalleryToolbar } from "@/components/GalleryToolbar";
import { PieceCard } from "@/components/PieceCard";

export function Gallery() {
  const [theme] = useTheme();
  const [category, setCategory] = useState<Category | "all">("ui");
  const [fps, setFps] = useState<FpsChoice>("native");
  const [mono, setMono] = useState(false);
  const [query, setQuery] = useState("");

  const counts = useMemo<Record<Category, number>>(() => {
    const acc = {} as Record<Category, number>;
    for (const c of CATEGORIES) acc[c] = 0;
    for (const piece of PIECES) acc[piece.category] += 1;
    return acc;
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rank = new Map<Category, number>(CATEGORIES.map((c, i) => [c, i]));
    return PIECES.filter(
      (piece) => category === "all" || piece.category === category,
    )
      .filter((piece) => {
        if (!q) return true;
        return (
          piece.name.toLowerCase().includes(q) ||
          piece.id.toLowerCase().includes(q) ||
          piece.note.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const ra = rank.get(a.category) ?? 0;
        const rb = rank.get(b.category) ?? 0;
        if (ra !== rb) return ra - rb;
        return a.name.localeCompare(b.name);
      });
  }, [category, query]);

  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader page="gallery" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 flex flex-col gap-5">
        <section className="flex flex-col gap-2">
          <h1 className="font-mono text-xl font-semibold">ascii.rest gallery</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Every piece in ascii.rest 0.2.1 — {PIECES.length} animated ascii
            pieces in 15 categories, drawn live in this page with the React
            component from ascii.rest/react. Pieces only animate while on
            screen. Coloured pieces draw on a canvas; mono draws them as text in
            one ink.
          </p>
        </section>

        <GalleryToolbar
          category={category}
          onCategory={setCategory}
          counts={counts}
          total={PIECES.length}
          fps={fps}
          onFps={setFps}
          mono={mono}
          onMono={setMono}
          query={query}
          onQuery={setQuery}
        />

        <p
          className="font-mono text-xs text-muted-foreground"
          data-testid="showing"
        >
          showing {visible.length} of {PIECES.length}
        </p>

        <div
          key={theme}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visible.length === 0 ? (
            <p className="text-sm text-muted-foreground">no piece matches</p>
          ) : (
            visible.map((piece) => (
              <PieceCard key={piece.id} piece={piece} fps={fps} mono={mono} />
            ))
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
