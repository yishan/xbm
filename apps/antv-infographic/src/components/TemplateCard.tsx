// Gallery demo using @antv/infographic (MIT). https://github.com/antvis/Infographic
// Bookmark: https://x.com/Huahuazo/status/2104558493244281026
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { TemplateSample } from "@/templates"

type TemplateCardProps = {
  sample: TemplateSample
  selected?: boolean
  onSelect: (id: string) => void
}

export function TemplateCard({
  sample,
  selected = false,
  onSelect,
}: TemplateCardProps) {
  const handleSelect = () => onSelect(sample.id)

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      data-testid={`card-${sample.id}`}
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          handleSelect()
        }
      }}
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "border-primary ring-2 ring-primary",
      )}
    >
      <CardHeader className="p-3 pb-1">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium leading-snug">{sample.name}</CardTitle>
          <Badge variant="secondary" className="shrink-0">
            {sample.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <CardDescription className="line-clamp-2">
          {sample.description}
        </CardDescription>
      </CardContent>
    </Card>
  )
}
