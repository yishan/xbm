import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import { Component } from "react";
import { useEffect, useRef, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import * as registry from "@/registry/default";
import { remarkSafeMdx } from "./safeMdx";

type MdxContent = ComponentType<{ components?: Record<string, unknown> }>;

const REGISTRY_COMPONENTS = new Set(
  Object.keys(registry).filter((name) => /^[A-Z]/.test(name)),
);

export function useMdx(source: string): {
  Content: MdxContent | null;
  error: string | null;
  version: number;
} {
  const [Content, setContent] = useState<MdxContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const requestRef = useRef(0);
  const firstRun = useRef(true);

  useEffect(() => {
    const requestId = ++requestRef.current;
    let cancelled = false;

    const timer = setTimeout(
      async () => {
        try {
          const mod = await evaluate(source, {
            ...runtime,
            remarkPlugins: [
              remarkGfm,
              [remarkSafeMdx, { components: REGISTRY_COMPONENTS }],
            ],
          } as Parameters<typeof evaluate>[1]);

          if (cancelled || requestId !== requestRef.current) return;

          setContent(() => mod.default as MdxContent);
          setError(null);
          setVersion((v) => v + 1);
        } catch (err) {
          if (cancelled || requestId !== requestRef.current) return;

          setError(firstLine(err instanceof Error ? err.message : String(err)));
        }
      },
      firstRun.current ? 0 : 180,
    );

    firstRun.current = false;

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [source]);

  return { Content, error, version };
}

function firstLine(message: string): string {
  const line = message.split("\n")[0]?.trim() || message;
  return line.length > 140 ? line.slice(0, 140) : line;
}

type FigureBoundaryProps = {
  resetKey: string;
  onError: (message: string) => void;
  children: ReactNode;
};

export class FigureBoundary extends Component<FigureBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  componentDidUpdate(prevProps: FigureBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  componentDidCatch(error: Error) {
    this.setState({ failed: true });
    this.props.onError(error.message || String(error));
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}
