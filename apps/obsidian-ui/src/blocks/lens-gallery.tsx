// Lens Gallery — an infinite draggable art grid seen through a barrel-distortion lens (raw WebGL).
// Inspired by ObsidianUI (obsidianui.dev, MIT). Re-implemented from scratch.
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface LensGalleryProps {
  className?: string;
  reducedMotion?: boolean;
  strength?: number;
}

const COLS = 4;
const ROWS = 3;
const TILE_W = 256;
const TILE_H = 320;
const TILE_H_NORM = 0.46;
const GAP_NORM = 0.06;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeAtlas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = COLS * TILE_W;
  canvas.height = ROWS * TILE_H;
  const ctx = canvas.getContext("2d")!;

  const palette = [
    ["#2e1065", "#7c3aed", "#c4b5fd"],
    ["#78350f", "#f59e0b", "#fde68a"],
    ["#134e4a", "#14b8a6", "#99f6e4"],
    ["#881337", "#f43f5e", "#fecdd3"],
    ["#1e3a8a", "#3b82f6", "#bfdbfe"],
    ["#3b0764", "#a855f7", "#e9d5ff"],
    ["#1f2937", "#64748b", "#e2e8f0"],
    ["#422006", "#d97706", "#fde68a"],
    ["#052e16", "#22c55e", "#bbf7d0"],
    ["#500724", "#ec4899", "#fbcfe8"],
    ["#172554", "#2563eb", "#bfdbfe"],
    ["#4a044e", "#c026d3", "#f5d0fe"],
  ];

  for (let i = 0; i < 12; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = col * TILE_W;
    const y = row * TILE_H;
    const [c0, c1, c2] = palette[i];

    const grad = ctx.createLinearGradient(x, y, x + TILE_W, y + TILE_H);
    grad.addColorStop(0, c0);
    grad.addColorStop(0.55, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, TILE_W, TILE_H);

    const rng = mulberry32(1000 + i * 37);
    const shapes = 2 + Math.floor(rng() * 2);
    for (let s = 0; s < shapes; s++) {
      const cx = x + TILE_W * (0.15 + rng() * 0.7);
      const cy = y + TILE_H * (0.15 + rng() * 0.6);
      const rad = 24 + rng() * 90;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad * 2);
      glow.addColorStop(0, `rgba(255,255,255,${0.35 + rng() * 0.45})`);
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, rad * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "600 18px Geist, system-ui, sans-serif";
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillText(`Study ${String(i + 1).padStart(2, "0")}`, x + 16, y + TILE_H - 16);

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "500 16px Geist, system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("2026", x + TILE_W - 16, y + TILE_H - 16);
  }

  return canvas;
}

export function LensGallery({ className, reducedMotion, strength = 0.35 }: LensGalleryProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  const defaultReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const effectiveReducedMotion = reducedMotion ?? defaultReducedMotion;

  const strengthRef = useRef(strength);
  strengthRef.current = strength;
  const reducedMotionRef = useRef(effectiveReducedMotion);
  reducedMotionRef.current = effectiveReducedMotion;

  const controlsRef = useRef<{ startLoop: () => void; stopLoop: () => void; render: () => void } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false }) as WebGLRenderingContext | null;
    if (!gl) {
      setWebglFailed(true);
      return;
    }

    const compileShader = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) ?? "Shader compile failed");
      }
      return shader;
    };

    const vertSrc = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fragSrc = `
      precision highp float;
      uniform vec2 uResolution;
      uniform vec2 uOffset;
      uniform sampler2D uTex;
      uniform float uStrength;
      uniform float uTileAspect;

      void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        vec2 p = (fragCoord - 0.5 * uResolution) / uResolution.y;
        float r2 = dot(p, p);
        p *= 1.0 + uStrength * r2;

        float tileH = ${TILE_H_NORM.toFixed(4)};
        float gap = ${GAP_NORM.toFixed(4)};
        float tileW = tileH * uTileAspect;
        float stepX = tileW * (1.0 + gap);
        float stepY = tileH * (1.0 + gap);

        vec2 panel = p / vec2(stepX, stepY) + uOffset;
        vec2 cell = floor(panel);
        vec2 local = fract(panel);
        vec2 tileSize = vec2(tileW / stepX, tileH / stepY);

        vec2 d = abs(local - 0.5 * tileSize) - 0.5 * tileSize;
        float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - 0.06;
        float mask = 1.0 - smoothstep(-0.03, 0.03, dist);

        float index = mod(cell.x + cell.y * 5.0, 12.0);
        float col = mod(index, 4.0);
        float row = floor(index / 4.0);

        vec2 uvInTile = clamp(local / tileSize, 0.0, 1.0);
        vec2 atlasUV = vec2((col + uvInTile.x) / 4.0, (row + uvInTile.y) / 3.0);

        float chroma = 0.004 * r2;
        vec3 color = vec3(
          texture2D(uTex, atlasUV + vec2(chroma, 0.0)).r,
          texture2D(uTex, atlasUV).g,
          texture2D(uTex, atlasUV - vec2(chroma, 0.0)).b
        );

        float vig = smoothstep(1.1, 0.35, length(p));
        color *= mix(0.35, 1.0, vig);

        vec3 bg = vec3(0.035, 0.035, 0.04);
        vec3 finalColor = mix(bg, color, mask);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const vert = compileShader(gl.VERTEX_SHADER, vertSrc);
    const frag = compileShader(gl.FRAGMENT_SHADER, fragSrc);
    const program = gl.createProgram()!;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? "Program link failed");
    }
    gl.deleteShader(vert);
    gl.deleteShader(frag);

    const uResolution = gl.getUniformLocation(program, "uResolution");
    const uOffset = gl.getUniformLocation(program, "uOffset");
    const uStrength = gl.getUniformLocation(program, "uStrength");
    const uTileAspect = gl.getUniformLocation(program, "uTileAspect");
    const uTex = gl.getUniformLocation(program, "uTex");
    const aPosition = gl.getAttribLocation(program, "aPosition");

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const atlas = makeAtlas();
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);

    const tileAspect = TILE_W / TILE_H;
    const stepXNorm = TILE_H_NORM * tileAspect * (1 + GAP_NORM);
    const stepYNorm = TILE_H_NORM * (1 + GAP_NORM);

    let cssHeight = 0;
    let offsetX = 0;
    let offsetY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let lastTime = performance.now();
    let rafId: number | null = null;
    let lastFrameTime = performance.now();

    const render = () => {
      gl.useProgram(program);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uOffset, offsetX, offsetY);
      gl.uniform1f(uStrength, strengthRef.current);
      gl.uniform1f(uTileAspect, tileAspect);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uTex, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const startLoop = () => {
      if (rafId !== null) return;
      lastFrameTime = performance.now();
      const tick = (now: number) => {
        rafId = requestAnimationFrame(tick);
        const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
        lastFrameTime = now;

        if (!dragging && !reducedMotionRef.current) {
          offsetX += 0.03 * dt;
          offsetY += 0.02 * dt;
          offsetX += velocityX * dt;
          offsetY += velocityY * dt;
          const decay = Math.pow(0.94, dt * 60);
          velocityX *= decay;
          velocityY *= decay;
          if (Math.abs(velocityX) < 0.00005 && Math.abs(velocityY) < 0.00005) {
            velocityX = 0;
            velocityY = 0;
          }
        }

        render();

        if (!dragging && reducedMotionRef.current) {
          cancelAnimationFrame(rafId as number);
          rafId = null;
          return;
        }
      };
      rafId = requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    controlsRef.current = { startLoop, stopLoop, render };

    const ResizeObserver = window.ResizeObserver;
    const resizeObserver = ResizeObserver
      ? new ResizeObserver(() => {
          const rect = wrapper.getBoundingClientRect();
          cssHeight = rect.height;
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const w = Math.max(1, Math.floor(rect.width * dpr));
          const h = Math.max(1, Math.floor(rect.height * dpr));
          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
            gl.viewport(0, 0, w, h);
            if (!reducedMotionRef.current) render();
          }
        })
      : null;
    if (resizeObserver) resizeObserver.observe(wrapper);

    const IntersectionObserverCtor = window.IntersectionObserver;
    const intersectionObserver = IntersectionObserverCtor
      ? new IntersectionObserverCtor(
          (entries) => {
            const entry = entries[0];
            if (!entry) return;
            if (entry.isIntersecting) {
              if (reducedMotionRef.current) {
                render();
              } else {
                startLoop();
              }
            } else {
              stopLoop();
            }
          },
          { threshold: 0 }
        )
      : null;
    if (intersectionObserver) intersectionObserver.observe(wrapper);

    const handlePointerDown = (event: PointerEvent) => {
      dragging = true;
      canvas.setPointerCapture(event.pointerId);
      lastX = event.clientX;
      lastY = event.clientY;
      lastTime = performance.now();
      velocityX = 0;
      velocityY = 0;
      startLoop();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dt = Math.max((now - lastTime) / 1000, 0.001);
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      if (cssHeight > 0) {
        offsetX += (dx / cssHeight) / stepXNorm;
        offsetY += (dy / cssHeight) / stepYNorm;
        velocityX = (dx / cssHeight) / stepXNorm / dt;
        velocityY = (dy / cssHeight) / stepYNorm / dt;
      }
      lastX = event.clientX;
      lastY = event.clientY;
      lastTime = now;
    };

    const handlePointerUp = (event: PointerEvent) => {
      dragging = false;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      render();
      if (reducedMotionRef.current) {
        velocityX = 0;
        velocityY = 0;
      }
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      offsetX += (event.deltaY + event.deltaX) * 0.0012;
      render();
      if (!reducedMotionRef.current) startLoop();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
          offsetX -= 0.25;
          break;
        case "ArrowRight":
          offsetX += 0.25;
          break;
        case "ArrowUp":
          offsetY += 0.25;
          break;
        case "ArrowDown":
          offsetY -= 0.25;
          break;
        default:
          return;
      }
      event.preventDefault();
      velocityX = 0;
      velocityY = 0;
      render();
      if (!reducedMotionRef.current) startLoop();
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    wrapper.addEventListener("keydown", handleKeyDown);

    if (!reducedMotionRef.current) {
      startLoop();
    } else {
      render();
    }

    return () => {
      stopLoop();
      if (resizeObserver) resizeObserver.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();
      controlsRef.current = null;
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      canvas.removeEventListener("wheel", handleWheel);
      wrapper.removeEventListener("keydown", handleKeyDown);
      gl.deleteTexture(texture);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      // No loseContext(): StrictMode re-runs this effect on the same canvas, and a
      // lost context cannot be reused synchronously. Resources are freed above.
    };
  }, []);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (effectiveReducedMotion) {
      controls.stopLoop();
      controls.render();
    } else {
      controls.startLoop();
    }
  }, [effectiveReducedMotion]);

  return (
    <div
      ref={wrapperRef}
      data-testid="lens-gallery"
      tabIndex={0}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 outline-none focus-visible:ring-1 focus-visible:ring-violet-400/70",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Draggable lensed art gallery"
        className="absolute inset-0 h-full w-full touch-none cursor-grab active:cursor-grabbing"
      />
      {webglFailed ? (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">
          WebGL not available
        </div>
      ) : null}
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400 backdrop-blur">
        drag to explore
      </div>
    </div>
  );
}
