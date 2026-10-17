import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(scriptDir, "..");
const specsDir = path.join(appDir, "src", "specs");
const outDir = path.join(appDir, "public", "diagrams");
const trackingFile = path.resolve(appDir, "..", "..", "tracking", "seen-bookmarks.json");
const ganttSpecFile = path.join(specsDir, "gallery-gantt.json");
const renderer = path.join(appDir, "vendor", "seecode", "scripts", "seecode.mjs");

const CN_MONTHS = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

function isDate(value) {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(time)) return false;
  return new Date(time).toISOString().slice(0, 10) === value;
}

function nextDay(value) {
  const time = Date.parse(`${value}T00:00:00Z`);
  return new Date(time + DAY_MS).toISOString().slice(0, 10);
}

function monthName(value) {
  const month = Number(value.slice(5, 7));
  return `${CN_MONTHS[month - 1] ?? String(month)}月`;
}

function shortLabel(value) {
  const text = typeof value === "string" ? value : "";
  const cut = text.search(/ — | \(/);
  const head = (cut >= 0 ? text.slice(0, cut) : text).trim();
  const clipped = head.length > 36 ? head.slice(0, 36).trim() : head;
  return clipped || "未命名 demo";
}

function buildGanttSpec() {
  if (!fs.existsSync(trackingFile)) {
    console.log("[diagrams] 未找到 tracking/seen-bookmarks.json，沿用现有甘特图规格");
    return;
  }

  let tracking;
  try {
    tracking = JSON.parse(fs.readFileSync(trackingFile, "utf8"));
  } catch (error) {
    console.warn(`[diagrams] 无法解析 tracking/seen-bookmarks.json（${error.message}），沿用现有甘特图规格`);
    return;
  }

  const built = Array.isArray(tracking?.built) ? tracking.built : [];
  const entries = built
    .filter((entry) => entry && typeof entry.slug === "string" && entry.slug.length > 0 && isDate(entry.built))
    .sort((a, b) => (a.built === b.built ? 0 : a.built < b.built ? -1 : 1))
    .slice(-18);

  if (entries.length === 0) {
    console.warn("[diagrams] tracking 中没有可用的 built 记录，沿用现有甘特图规格");
    return;
  }

  const tasks = entries.map((entry) => {
    const task = {
      id: entry.slug.replace(/[^A-Za-z0-9_]/g, "_"),
      label: shortLabel(entry.title),
      section: monthName(entry.built),
      start: isDate(entry.date) && entry.date <= entry.built ? entry.date : entry.built,
      end: nextDay(entry.built),
    };
    if (entry.slug === "seecode") task.focal = true;
    else task.done = true;
    return task;
  });

  const first = entries[0].built;
  const last = entries[entries.length - 1].built;
  const seecode = entries.find((entry) => entry.slug === "seecode");

  const spec = {
    type: "gantt",
    lang: "zh-CN",
    eyebrow: "公开数据 · 甘特图",
    title: "画廊上线时间线",
    subtitle: "每条从收藏日期到上线日期，数据来自公开的 tracking/seen-bookmarks.json",
    motion: "reveal",
    today: last,
    tasks,
    milestones: [
      { label: "首个 demo", date: first },
      { label: "SeeCode 上线", date: seecode ? seecode.built : last, focal: true },
    ],
  };

  fs.writeFileSync(ganttSpecFile, `${JSON.stringify(spec, null, 1)}\n`);
  console.log(`[diagrams] 生成 src/specs/gallery-gantt.json（${tasks.length} 条任务）`);
}

function parseLastJsonLine(stdout) {
  const lines = String(stdout ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const last = lines[lines.length - 1];
  if (!last) return null;
  try {
    return JSON.parse(last);
  } catch {
    return null;
  }
}

function renderSpecs() {
  fs.mkdirSync(outDir, { recursive: true });

  const names = fs
    .readdirSync(specsDir)
    .filter((name) => name.endsWith(".json"))
    .sort();

  for (const name of names) {
    const specPath = path.join(specsDir, name);
    const outFile = path.join(outDir, `${name.replace(/\.json$/, "")}.html`);

    let stdout = "";
    let failure = null;
    try {
      stdout = execFileSync(process.execPath, [renderer, "render", specPath, "--out", outFile], {
        cwd: appDir,
        encoding: "utf8",
      });
    } catch (error) {
      failure = error;
      stdout = typeof error?.stdout === "string" ? error.stdout : "";
    }

    const result = parseLastJsonLine(stdout);
    if (!result || result.ok !== true) {
      if (result) console.error(`[diagrams] ${name} 渲染失败：${JSON.stringify(result)}`);
      else if (failure) console.error(`[diagrams] ${name} 渲染失败：${failure.message}`);
      else console.error(`[diagrams] ${name} 渲染失败：输出无法解析`);
      process.exit(1);
    }

    const problems = Array.isArray(result.problems) ? result.problems : [];
    console.log(`[diagrams] ${name} ok (${problems.length} warnings)`);
    for (const problem of problems) {
      console.log(`  - ${problem?.code ?? "unknown"}: ${problem?.msg ?? ""}`);
    }
  }
}

buildGanttSpec();
renderSpecs();
