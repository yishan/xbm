import { ExternalLink, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

type Page = "gallery" | "fleet" | "plain";

const NAV: { id: Page; label: string; href: string }[] = [
  { id: "gallery", label: "gallery", href: `${import.meta.env.BASE_URL}` },
  { id: "fleet", label: "fleet", href: `${import.meta.env.BASE_URL}fleet.html` },
  { id: "plain", label: "plain html", href: `${import.meta.env.BASE_URL}plain.html` },
];

export function SiteHeader({ page }: { page: Page }) {
  const [theme, setTheme] = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <a
          href={import.meta.env.BASE_URL}
          className="flex shrink-0 items-baseline gap-1.5 font-mono text-sm font-semibold text-foreground"
        >
          ascii.rest
          <span className="hidden text-xs font-normal text-muted-foreground sm:inline">&times; xbm</span>
        </a>

        <nav className="flex min-w-0 items-center gap-3 overflow-x-auto font-mono text-xs">
          {NAV.map((item) => {
            const current = item.id === page;
            return (
              <a
                key={item.id}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap transition-colors",
                  current
                    ? "text-foreground underline underline-offset-4"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <a
            href="https://www.npmjs.com/package/ascii.rest/v/0.2.1"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            npm 0.2.1
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={isDark ? "switch to light" : "switch to dark"}
            aria-pressed={isDark}
            data-testid="theme-toggle"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
