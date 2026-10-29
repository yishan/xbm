export const HERO_FIELD: string = `
float heroCurtain(vec2 p, float t) {
  float warp = fbm(p * 1.4 + vec2(t * 0.025, t * 0.012));
  float bandA = fbm(vec2(p.x * 0.9 + warp * 1.6 + t * 0.022, p.y * 3.1 - warp * 0.7));
  float bandB = fbm(vec2(p.x * 2.2 - warp * 0.9 - t * 0.018, p.y * 1.7 + warp * 1.1));
  return clamp(bandA * 0.72 + bandB * 0.46, 0.0, 1.0);
}

float field(vec2 uv, vec2 res, float t) {
  float aspect = res.x / res.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float curtains = heroCurtain(p, t);
  float top = smoothstep(0.08, 0.92, uv.y);
  float right = 0.45 + 0.55 * smoothstep(0.0, 1.0, uv.x);
  float tone = clamp(curtains * top * right * 1.45, 0.0, 1.0);
  // Hold the title block at the left-centre almost clear.
  float leftEdge = 1.0 - smoothstep(0.42, 0.62, uv.x);
  float midBand = smoothstep(0.10, 0.30, uv.y) * (1.0 - smoothstep(0.72, 0.92, uv.y));
  float clearMask = 1.0 - leftEdge * midBand;
  tone = mix(0.03, tone, clearMask);
  return clamp(tone * heroIntensity, 0.0, 1.0);
}
`;

export type FieldPreset = {
  id: string;
  name: string;
  description: string;
  glsl: string;
};

const AURORA_FIELD: string = `
float pgAurora(vec2 p, float t) {
  float warp = fbm(p * 1.2 + vec2(t * 0.02, -t * 0.015));
  float bands = fbm(vec2(p.x * 0.8 + warp * 1.8 + t * 0.025, p.y * 2.4 - warp * 0.9));
  float fine = 0.35 * snoise(vec2(p.x * 3.0 - t * 0.04, p.y * 1.6 + warp));
  return clamp(bands * 0.9 + fine * 0.35, 0.0, 1.0);
}

float field(vec2 uv, vec2 res, float t) {
  float aspect = res.x / res.y;
  vec2 p = vec2(uv.x * aspect, uv.y) * fieldScale;
  float tone = pgAurora(p, t);
  tone *= mix(0.4, 1.0, smoothstep(0.0, 0.75, uv.y));
  return clamp(tone * fieldIntensity, 0.0, 1.0);
}
`;

const CONTOURS_FIELD: string = `
float pgContourLine(float h, float hx, float hy, float count, float width) {
  float v = h * count;
  float offset = abs(fract(v + 0.5) - 0.5);
  float perCell = max(length(vec2(hx - h, hy - h)) * count, 0.0001);
  float d = offset / perCell;
  float line = 1.0 - smoothstep(width * 0.5 - 0.5, width * 0.5 + 0.5, d);
  return line * (1.0 - smoothstep(0.06, 0.1, offset));
}

float pgHeight(vec2 p, float t) {
  return 0.5
    + 0.32 * snoise(p * 0.8 + vec2(t * 0.02, -t * 0.01))
    + 0.18 * snoise(p * 1.9 + vec2(-t * 0.015, t * 0.02));
}

float field(vec2 uv, vec2 res, float t) {
  float aspect = res.x / res.y;
  float cellUnit = fieldScale / res.y;
  vec2 p = vec2(uv.x * aspect, uv.y) * fieldScale;
  float h = pgHeight(p, t);
  float hx = pgHeight(p + vec2(cellUnit, 0.0), t);
  float hy = pgHeight(p + vec2(0.0, cellUnit), t);
  float lines = pgContourLine(h, hx, hy, 10.0, 1.5);
  return clamp(lines * fieldIntensity, 0.0, 1.0);
}
`;

const RINGS_FIELD: string = `
float field(vec2 uv, vec2 res, float t) {
  float aspect = res.x / res.y;
  vec2 c = (uv - 0.5) * vec2(aspect, 1.0);
  float dist = length(c);
  float rings = 0.5 + 0.5 * sin(dist * fieldScale * 10.0 - t * 1.2);
  float fade = exp(-dist * dist * 3.2);
  float shade = mix(0.35, 1.0, smoothstep(-0.35, 0.35, -c.y - c.x * 0.35));
  return clamp(rings * fade * shade * 1.45 * fieldIntensity, 0.0, 1.0);
}
`;

const WAVES_FIELD: string = `
float pgSeaTone(vec2 p, float t) {
  float h = 0.0;
  h += 0.55 * sin(p.y * 3.1 + t * 0.35 + sin(p.x * 1.4 + t * 0.12) * 0.9);
  h += 0.30 * sin(p.y * 5.2 - t * 0.22 + sin(p.x * 2.3 - t * 0.08) * 0.6);
  h += 0.15 * sin(p.y * 8.4 + t * 0.16 + sin(p.x * 3.7 + t * 0.05) * 0.4);
  return 0.5 + 0.5 * h;
}

float field(vec2 uv, vec2 res, float t) {
  float aspect = res.x / res.y;
  vec2 p = vec2(uv.x * aspect, uv.y) * fieldScale;
  float tone = pgSeaTone(p, t);
  float depth = smoothstep(0.0, 0.85, 1.0 - uv.y);
  return clamp(tone * depth * 1.5 * fieldIntensity, 0.0, 1.0);
}
`;

export const PRESET_FIELDS: FieldPreset[] = [
  {
    id: "aurora",
    name: "极光 Aurora",
    description: "缓慢漂移的极光帘幕，适合大面积背景。",
    glsl: AURORA_FIELD,
  },
  {
    id: "contours",
    name: "等高线 Contours",
    description: "低频噪声的等高线，像缓缓流动的地形。",
    glsl: CONTOURS_FIELD,
  },
  {
    id: "rings",
    name: "涟漪 Rings",
    description: "从中心向外扩散的同心圆波纹。",
    glsl: RINGS_FIELD,
  },
  {
    id: "waves",
    name: "波浪 Waves",
    description: "层叠的水平波浪，向下逐渐加深如海平线。",
    glsl: WAVES_FIELD,
  },
];

export const DEFAULT_PRESET_ID = "aurora";

export const MINI_FIELD: string = `
float field(vec2 uv, vec2 res, float t) {
  float aspect = res.x / res.y;
  vec2 c = (uv - 0.5) * vec2(aspect, 1.0);
  float angle = t * 0.5236; // one orbit every ~12 s
  vec2 orb = vec2(cos(angle), sin(angle)) * 0.25;
  vec2 d = c - orb;
  float glow = exp(-dot(d, d) * 26.0);
  float rim = exp(-abs(length(d) - 0.16) * 55.0);
  float shade = mix(0.55, 1.0, smoothstep(-0.2, 0.2, d.y + d.x * 0.6));
  return clamp((glow * 0.95 + rim * 0.55) * shade, 0.0, 1.0);
}
`;
