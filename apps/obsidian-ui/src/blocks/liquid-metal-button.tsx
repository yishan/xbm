// Liquid Metal Button — raw WebGL shader behind a pill button.
// Inspired by ObsidianUI (obsidianui.dev, MIT). Re-implemented from scratch.
import { useEffect, useRef, type ReactNode } from "react"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export interface LiquidMetalButtonProps {
  children?: ReactNode
  className?: string
  onClick?: () => void
  reducedMotion?: boolean
  speed?: number
  disabled?: boolean
  "aria-label"?: string
  "data-testid"?: string
}

const VERT = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const FRAG = `
precision mediump float;
uniform vec2 uResolution;
uniform float uTime;
uniform float uSpeed;
uniform float uBrightness;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = uv;
  p.x *= uResolution.x / uResolution.y;

  float t = uTime * uSpeed;
  float f = sin(p.x * 3.0 + t * 0.9 + sin(p.y * 4.0 + t * 0.7) * 1.2)
          + sin(p.y * 5.0 - t * 0.6 + sin(p.x * 2.0 - t) * 1.5)
          + sin(p.x * 7.0 + p.y * 8.0 + t * 1.1) * 0.4;

  float bands = 0.5 + 0.5 * cos(f * 3.14159);
  bands = pow(bands, 1.7);

  vec3 chrome1 = vec3(0.102, 0.102, 0.118); // #1a1a1e
  vec3 chrome2 = vec3(0.42, 0.42, 0.46);   // #6b6b75
  vec3 chrome3 = vec3(0.83, 0.83, 0.85);   // #d4d4d8
  vec3 chrome4 = vec3(1.0);                // #ffffff

  vec3 color = mix(chrome1, chrome2, smoothstep(0.0, 0.4, bands));
  color = mix(color, chrome3, smoothstep(0.4, 0.7, bands));
  color = mix(color, chrome4, smoothstep(0.7, 1.0, bands));

  float spec = pow(max(0.0, sin(f * 18.8495)), 12.0);
  color += spec * 0.35;

  color += vec3(0.08, 0.0, 0.10) * sin(f * 1.2) * 0.15;
  color += vec3(0.0, 0.06, 0.12) * cos(f * 0.9) * 0.15;

  gl_FragColor = vec4(color * uBrightness, 1.0);
}
`

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export function LiquidMetalButton({
  children,
  className,
  onClick,
  reducedMotion,
  speed = 1,
  disabled,
  "aria-label": ariaLabel,
  "data-testid": dataTestid,
}: LiquidMetalButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hoverRef = useRef(false)

  useEffect(() => {
    const button = buttonRef.current
    const canvas = canvasRef.current
    if (!button || !canvas) return

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const reduced = reducedMotion ?? prefersReduced

    const gl = canvas.getContext("webgl", { alpha: false, antialias: true }) as WebGLRenderingContext | null
    if (!gl) {
      canvas.style.background = "conic-gradient(from 180deg at 50% 50%, #1a1a1e, #6b6b75, #d4d4d8, #ffffff, #1a1a1e)"
      return
    }

    const vert = createShader(gl, gl.VERTEX_SHADER, VERT)
    const frag = createShader(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vert || !frag) {
      canvas.style.background = "conic-gradient(from 180deg at 50% 50%, #1a1a1e, #6b6b75, #d4d4d8, #ffffff, #1a1a1e)"
      return
    }

    const program = gl.createProgram()
    if (!program) {
      canvas.style.background = "conic-gradient(from 180deg at 50% 50%, #1a1a1e, #6b6b75, #d4d4d8, #ffffff, #1a1a1e)"
      return
    }

    gl.attachShader(program, vert)
    gl.attachShader(program, frag)
    gl.linkProgram(program)
    gl.deleteShader(vert)
    gl.deleteShader(frag)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(program))
      canvas.style.background = "conic-gradient(from 180deg at 50% 50%, #1a1a1e, #6b6b75, #d4d4d8, #ffffff, #1a1a1e)"
      return
    }

    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

    const location = gl.getAttribLocation(program, "aPosition")
    gl.enableVertexAttribArray(location)
    gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0)

    const uResolution = gl.getUniformLocation(program, "uResolution")!
    const uTime = gl.getUniformLocation(program, "uTime")!
    const uSpeed = gl.getUniformLocation(program, "uSpeed")!
    const uBrightness = gl.getUniformLocation(program, "uBrightness")!

    let raf = 0
    let visible = true
    let width = 0
    let height = 0
    let dpr = 1
    let lastTime = performance.now()
    let currentSpeed = speed
    let currentBrightness = 1

    const drawFrame = (timeValue: number) => {
      const targetSpeed = hoverRef.current ? speed * 2.2 : speed
      const targetBrightness = hoverRef.current ? 1.1 : 1.0

      if (!reduced) {
        const now = performance.now()
        const dt = Math.min((now - lastTime) / 1000, 0.1)
        lastTime = now
        currentSpeed += (targetSpeed - currentSpeed) * Math.min(1, dt * 8)
        currentBrightness += (targetBrightness - currentBrightness) * Math.min(1, dt * 8)
      } else {
        currentSpeed = targetSpeed
        currentBrightness = targetBrightness
      }

      gl.uniform1f(uTime, reduced ? 1.7 : timeValue)
      gl.uniform1f(uSpeed, currentSpeed)
      gl.uniform1f(uBrightness, currentBrightness)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    const resize = () => {
      const rect = button.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uResolution, canvas.width, canvas.height)
      drawFrame(reduced ? 1.7 : 0)
    }

    const loop = (now: number) => {
      if (!visible) {
        raf = requestAnimationFrame(loop)
        return
      }
      drawFrame(now / 1000)
      raf = requestAnimationFrame(loop)
    }

    const handleEnter = () => {
      hoverRef.current = true
      if (reduced) drawFrame(1.7)
    }

    const handleLeave = () => {
      hoverRef.current = false
      if (reduced) drawFrame(1.7)
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !reduced) {
        lastTime = performance.now()
      }
    })

    const ro = new ResizeObserver(resize)
    ro.observe(button)
    observer.observe(button)

    button.addEventListener("pointerenter", handleEnter)
    button.addEventListener("pointerleave", handleLeave)

    resize()

    if (!reduced) {
      raf = requestAnimationFrame(loop)
    } else {
      drawFrame(1.7)
    }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      observer.disconnect()
      button.removeEventListener("pointerenter", handleEnter)
      button.removeEventListener("pointerleave", handleLeave)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      // No loseContext(): StrictMode re-runs this effect on the same canvas, and a
      // lost context cannot be reused synchronously. Resources are freed above.
    }
  }, [reducedMotion, speed])

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      data-testid={dataTestid}
      className={cn(
        "relative isolate h-12 rounded-full px-7 overflow-hidden transition-transform duration-200 active:scale-[0.97] disabled:opacity-60 disabled:pointer-events-none",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full rounded-full"
        aria-hidden="true"
      />
      <span className="pointer-events-none absolute inset-[3px] rounded-full bg-zinc-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]" />
      <span className="relative z-10 inline-flex items-center gap-2 text-sm font-medium text-zinc-100">
        {children ?? (
          <>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Get started
          </>
        )}
      </span>
    </button>
  )
}
