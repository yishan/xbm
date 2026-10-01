// Showcase inspired by satnaing/shadcn-admin (MIT). https://github.com/satnaing/shadcn-admin
import { useState } from "react"
import { toast } from "sonner"
import { useTheme, type Theme } from "@/components/theme-provider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ThemeOption = {
  value: Theme
  label: string
}

const themeOptions: ThemeOption[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

const fontOptions = [
  { value: "geist", label: "Geist" },
  { value: "inter", label: "Inter" },
  { value: "system", label: "System" },
]

function MockPane({
  className,
  barClass,
}: {
  className?: string
  barClass?: string
}) {
  return (
    <div className={cn("flex-1 space-y-1.5 p-2", className)}>
      <div className={cn("h-2 w-1/2 rounded-sm", barClass)} />
      <div className={cn("h-2 w-2/3 rounded-sm", barClass)} />
      <div className={cn("h-2 w-1/3 rounded-sm", barClass)} />
    </div>
  )
}

function ThemePreview({ value }: { value: Theme }) {
  if (value === "system") {
    return (
      <div className="flex h-20 w-full overflow-hidden rounded-md border">
        <MockPane className="bg-[#ecedef]" barClass="bg-white" />
        <MockPane className="border-l bg-slate-950" barClass="bg-slate-800" />
      </div>
    )
  }

  const isLight = value === "light"
  return (
    <div className="flex h-20 w-full overflow-hidden rounded-md border">
      <MockPane
        className={isLight ? "bg-[#ecedef]" : "bg-slate-950"}
        barClass={isLight ? "bg-white" : "bg-slate-800"}
      />
    </div>
  )
}

export function AppearanceForm() {
  const { theme, setTheme } = useTheme()
  const [font, setFont] = useState("geist")
  const [compact, setCompact] = useState(false)

  return (
    <div className="max-w-2xl space-y-8" data-testid="appearance-form">
      <div className="space-y-3">
        <div className="space-y-1">
          <Label>Theme</Label>
          <p className="text-sm text-muted-foreground">
            Select the theme for the dashboard.
          </p>
        </div>
        <RadioGroup
          value={theme}
          onValueChange={(v) => setTheme(v as Theme)}
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {themeOptions.map((option) => (
            <Label
              key={option.value}
              htmlFor={`appearance-${option.value}`}
              data-testid={`appearance-${option.value}`}
              className={cn(
                "flex cursor-pointer flex-col gap-2 rounded-lg border-2 p-1 transition-colors",
                theme === option.value
                  ? "border-primary"
                  : "border-muted hover:border-accent"
              )}
            >
              <RadioGroupItem
                id={`appearance-${option.value}`}
                value={option.value}
                className="sr-only"
              />
              <ThemePreview value={option.value} />
              <span className="text-center text-sm font-medium">
                {option.label}
              </span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="appearance-font">Font</Label>
          <p className="text-sm text-muted-foreground">
            Set the font you want to use in the dashboard.
          </p>
        </div>
        <Select value={font} onValueChange={setFont}>
          <SelectTrigger
            id="appearance-font"
            data-testid="appearance-font"
            className="w-full max-w-xs"
          >
            <SelectValue placeholder="Select a font" />
          </SelectTrigger>
          <SelectContent>
            {fontOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Font switching is cosmetic in this demo.
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="appearance-density">Density</Label>
          <p className="text-sm text-muted-foreground">
            Adjust the spacing of tables and lists.
          </p>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label
              htmlFor="appearance-density"
              className="cursor-pointer text-sm font-medium"
            >
              Compact tables
            </Label>
            <p className="text-sm text-muted-foreground">
              Reduce padding to fit more rows on screen.
            </p>
          </div>
          <Switch
            id="appearance-density"
            checked={compact}
            onCheckedChange={setCompact}
            data-testid="appearance-density"
          />
        </div>
      </div>

      <div>
        <Button
          onClick={() => toast.success("Preferences saved")}
          data-testid="appearance-submit"
        >
          Update preferences
        </Button>
      </div>
    </div>
  )
}
