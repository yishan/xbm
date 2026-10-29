export const DAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"] as const;

export type SourceStat = {
  name: string;
  items: number;
  color: "blue" | "purple" | "green" | "orange" | "pink";
};

export const ITEMS_PER_BRIEF: { day: string; items: number }[] = [
  { day: "周一", items: 18 },
  { day: "周二", items: 24 },
  { day: "周三", items: 21 },
  { day: "周四", items: 31 },
  { day: "周五", items: 27 },
  { day: "周六", items: 12 },
  { day: "周日", items: 9 },
];

export const SOURCES: SourceStat[] = [
  { name: "Readwise", items: 46, color: "blue" },
  { name: "播客", items: 32, color: "purple" },
  { name: "X 书签", items: 28, color: "green" },
  { name: "RSS", items: 21, color: "orange" },
  { name: "Newsletter", items: 15, color: "pink" },
];

export const READING = { minutes: 27, goal: 40, label: "今日阅读" };

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function bumpAt(hour: number, centre: number, width: number): number {
  const d = hour - centre;
  return Math.exp(-(d * d) / (2 * width * width));
}

const rng = mulberry32(29);

export const HOURLY: number[][] = DAYS.map((_, dayIndex) => {
  const weekend = dayIndex >= 5;
  const morningCentre = weekend ? 10.6 : 8.0;
  const morningWidth = weekend ? 1.2 : 1.1;
  const row: number[] = [];
  for (let hour = 0; hour < 24; hour += 1) {
    const morning = bumpAt(hour, morningCentre, morningWidth);
    const evening = bumpAt(hour, 22.0, 1.4);
    const jitter = rng() * 0.22 * (morning + evening + 0.6);
    row.push(0.06 + 0.9 * morning + 0.85 * evening + jitter);
  }
  const peak = Math.max(...row);
  return row.map((value) => Math.round((value / peak) * 1000) / 1000);
});

export const totalItems = (): number =>
  ITEMS_PER_BRIEF.reduce((sum, entry) => sum + entry.items, 0);

export const avgItems = (): number =>
  Math.round((totalItems() / ITEMS_PER_BRIEF.length) * 10) / 10;
