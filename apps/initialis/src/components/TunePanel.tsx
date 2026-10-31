import { useEffect, useId, useMemo, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";

import { getFonts, getParams } from "@/lib/initialis";
import type { CapSettings, FontInfo, ParamDef } from "@/lib/initialis";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

/* -------------------------------------------------------------------------- */
/* Labels and parameter helpers                                                */
/* -------------------------------------------------------------------------- */

const LABELS: Record<string, string> = {
  text: "首字母",
  font: "字体",
  size: "字号",
  lFill: "填充",
  lInline: "内描边",
  lShadow: "投影",
  frame: "边框",
  fMargin: "边距",
  fRules: "线宽",
  fCorner: "圆角",
  orn: "藤蔓",
  seed: "种子",
  oDensity: "密度",
  oCurl: "卷曲",
  oBranch: "分枝",
  oStemW: "藤茎",
  paper: "纸",
  inkA: "墨 A",
  inkB: "墨 B",
  inkC: "墨 C",
  grain: "颗粒",
};

type NumberSpec = { min: number; max: number; step: number };
type Choice = { value: string; label: string };

function numberSpec(spec: unknown): NumberSpec | null {
  if (!Array.isArray(spec) || spec.length < 2) return null;
  const min = spec[0];
  const max = spec[1];
  const rawStep = spec.length > 2 ? spec[2] : 1;
  if (typeof min !== "number" || typeof max !== "number") return null;
  const step = typeof rawStep === "number" && rawStep > 0 ? rawStep : 1;
  return { min, max, step };
}

function choiceSpec(spec: unknown): Choice[] | null {
  if (!Array.isArray(spec) || spec.length === 0) return null;
  if (numberSpec(spec) !== null) return null;

  const options: Choice[] = [];
  for (const entry of spec) {
    if (typeof entry === "string") {
      options.push({ value: entry, label: entry });
      continue;
    }
    if (entry !== null && typeof entry === "object") {
      const row = entry as Record<string, unknown>;
      const value = row.value ?? row.id;
      const label = row.label ?? row.name ?? value;
      if (typeof value === "string" && typeof label === "string") {
        options.push({ value, label });
      }
    }
  }
  return options.length > 0 ? options : null;
}

function decimalsOf(step: number): number {
  const text = String(step);
  const dot = text.indexOf(".");
  if (dot === -1) return 0;
  return Math.min(6, text.length - dot - 1);
}

/**
 * `<input type="color">` only accepts a literal hex value. This is user data,
 * not theme styling, so the fallback cannot be expressed as a theme token.
 */
function colorValue(value: unknown): string {
  if (typeof value === "string") {
    if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
    if (/^#[0-9a-fA-F]{3}$/.test(value)) {
      const r = value.charAt(1);
      const g = value.charAt(2);
      const b = value.charAt(3);
      return `#${r}${r}${g}${g}${b}${b}`;
    }
  }
  return "#000000";
}

/* -------------------------------------------------------------------------- */
/* Small presentational fields                                                 */
/* -------------------------------------------------------------------------- */

function Row({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Label htmlFor={htmlFor} className="text-[13px] text-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function Field({
  label,
  readout,
  children,
}: {
  label: string;
  readout: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label className="text-[13px] text-foreground">{label}</Label>
        <span className="text-[12px] tabular-nums text-muted-foreground">{readout}</span>
      </div>
      {children}
    </div>
  );
}

function NumberField({
  label,
  current,
  spec,
  onChange,
}: {
  label: string;
  current: unknown;
  spec: NumberSpec;
  onChange: (value: number) => void;
}) {
  const numeric = typeof current === "number" && Number.isFinite(current) ? current : Number(current);
  const safe = Number.isFinite(numeric) ? Math.min(spec.max, Math.max(spec.min, numeric)) : spec.min;

  return (
    <Field label={label} readout={safe.toFixed(decimalsOf(spec.step))}>
      <Slider
        aria-label={label}
        min={spec.min}
        max={spec.max}
        step={spec.step}
        value={[safe]}
        onValueChange={(next) => {
          const value = next[0];
          if (typeof value === "number") onChange(value);
        }}
      />
    </Field>
  );
}

function SelectField({
  label,
  current,
  options,
  onChange,
}: {
  label: string;
  current: unknown;
  options: Choice[];
  onChange: (value: string) => void;
}) {
  const value = typeof current === "string" ? current : String(current ?? "");

  return (
    <Row label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 w-36 text-[13px] pointer-coarse:h-11" aria-label={label}>
          <SelectValue placeholder="—" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-[13px]">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Row>
  );
}

function SwitchField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Row label={label}>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </Row>
  );
}

function ColorField({
  id,
  label,
  current,
  onChange,
}: {
  id: string;
  label: string;
  current: unknown;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-[13px] text-muted-foreground">
        {label}
      </Label>
      <input
        id={id}
        type="color"
        value={colorValue(current)}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full cursor-pointer rounded-md border border-border bg-background p-1 pointer-coarse:h-11"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Panel                                                                       */
/* -------------------------------------------------------------------------- */

type TunePanelProps = {
  settings: CapSettings;
  onChange: (patch: CapSettings) => void;
  onReset: () => void;
};

export function TunePanel({ settings, onChange, onReset }: TunePanelProps) {
  const uid = useId();
  const [params, setParams] = useState<ParamDef[] | null>(null);
  const [fonts, setFonts] = useState<FontInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [loadedParams, loadedFonts] = await Promise.all([getParams(), getFonts()]);
        if (cancelled) return;
        setParams(loadedParams);
        setFonts(loadedFonts.filter((font) => font.caps));
      } catch (cause) {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.message : String(cause));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const paramMap = useMemo(() => {
    const map = new Map<string, ParamDef>();
    for (const param of params ?? []) map.set(param.key, param);
    return map;
  }, [params]);

  const merged = useMemo<CapSettings>(() => {
    const next: CapSettings = {};

    for (const param of params ?? []) {
      const current = settings[param.key];
      if (current !== undefined) {
        next[param.key] = current;
      } else if (
        typeof param.def === "string" ||
        typeof param.def === "number" ||
        typeof param.def === "boolean"
      ) {
        next[param.key] = param.def;
      }
    }

    for (const [key, value] of Object.entries(settings)) {
      if (value !== undefined && !(key in next)) next[key] = value;
    }

    return next;
  }, [params, settings]);

  const isVisible = (key: string): boolean => {
    const param = paramMap.get(key);
    if (!param || !param.when) return true;
    return param.when(merged);
  };

  const labelFor = (key: string): string => LABELS[key] ?? paramMap.get(key)?.label ?? key;

  const numberField = (key: string): ReactNode => {
    if (!isVisible(key)) return null;
    const spec = numberSpec(paramMap.get(key)?.spec);
    if (!spec) return null;
    return (
      <NumberField
        key={key}
        label={labelFor(key)}
        current={merged[key]}
        spec={spec}
        onChange={(value) => onChange({ [key]: value })}
      />
    );
  };

  const selectField = (key: string, options: Choice[] | null): ReactNode => {
    if (!isVisible(key) || options === null || options.length === 0) return null;
    return (
      <SelectField
        key={key}
        label={labelFor(key)}
        current={merged[key]}
        options={options}
        onChange={(value) => onChange({ [key]: value })}
      />
    );
  };

  const colorField = (key: string): ReactNode => {
    if (!isVisible(key)) return null;
    return (
      <ColorField
        key={key}
        id={`${uid}-${key}`}
        label={labelFor(key)}
        current={merged[key]}
        onChange={(value) => onChange({ [key]: value })}
      />
    );
  };

  const fontOptions: Choice[] | null =
    fonts === null || fonts.length === 0
      ? null
      : fonts.map((font) => ({ value: font.id, label: font.name }));

  const text =
    typeof merged.text === "string"
      ? merged.text.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 1)
      : "";

  const onTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const letters = event.target.value.toUpperCase().replace(/[^A-Z]/g, "");
    if (letters.length === 0) return;
    onChange({ text: letters.slice(-1) });
  };

  const seed = merged.seed;
  const seedText = typeof seed === "number" ? String(seed) : typeof seed === "string" ? seed : "—";

  if (error !== null) {
    return (
      <p className="text-[13px] leading-6 text-muted-foreground">
        参数加载失败：{error}
      </p>
    );
  }

  if (params === null || fonts === null) {
    return (
      <p className="text-[13px] leading-6 text-muted-foreground" aria-busy="true">
        正在加载参数…
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <section className="flex flex-col gap-3">
        <h3 className="text-[12px] uppercase tracking-[0.04em] text-muted-foreground">字母</h3>

        {isVisible("text") ? (
          <Row label={labelFor("text")} htmlFor={`${uid}-text`}>
            <input
              id={`${uid}-text`}
              type="text"
              value={text}
              maxLength={1}
              autoComplete="off"
              spellCheck={false}
              aria-label="首字母"
              placeholder="A"
              onFocus={(event) => event.currentTarget.select()}
              onChange={onTextChange}
              className="h-8 w-12 rounded-md border border-border bg-background text-center text-[16px] uppercase text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring pointer-coarse:h-11"
            />
          </Row>
        ) : null}

        {selectField("font", fontOptions)}
        {numberField("size")}
        {numberField("lFill")}
        {numberField("lInline")}
        {numberField("lShadow")}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-[12px] uppercase tracking-[0.04em] text-muted-foreground">边框</h3>

        {selectField("frame", choiceSpec(paramMap.get("frame")?.spec))}
        {numberField("fMargin")}
        {numberField("fRules")}
        {numberField("fCorner")}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-[12px] uppercase tracking-[0.04em] text-muted-foreground">藤蔓</h3>

        {isVisible("orn") ? (
          <SwitchField
            label={labelFor("orn")}
            checked={merged.orn !== "none" && merged.orn !== false}
            onChange={(checked) => onChange({ orn: checked ? "grow" : "none" })}
          />
        ) : null}

        {isVisible("seed") ? (
          <Row label={labelFor("seed")}>
            <div className="flex items-center gap-2">
              <span className="text-[12px] tabular-nums text-muted-foreground">{seedText}</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="pointer-coarse:min-h-11 pointer-coarse:min-w-11"
                onClick={() => onChange({ seed: Math.floor(Math.random() * 99999) + 1 })}
              >
                换一枝
              </Button>
            </div>
          </Row>
        ) : null}

        {numberField("oDensity")}
        {numberField("oCurl")}
        {numberField("oBranch")}
        {numberField("oStemW")}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-[12px] uppercase tracking-[0.04em] text-muted-foreground">油墨与颜色</h3>

        <div className="grid grid-cols-4 gap-2">
          {colorField("paper")}
          {colorField("inkA")}
          {colorField("inkB")}
          {colorField("inkC")}
        </div>

        {numberField("grain")}
      </section>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="self-start pointer-coarse:min-h-11 pointer-coarse:min-w-11"
        onClick={onReset}
      >
        恢复默认
      </Button>
    </div>
  );
}
