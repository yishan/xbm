// Showcase inspired by satnaing/shadcn-admin (MIT). https://github.com/satnaing/shadcn-admin
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

type NotificationMode = "all" | "mentions" | "none"

type NotificationsFormValues = {
  type: NotificationMode
  marketing: boolean
  security: boolean
  weekly: boolean
  mobile: boolean
}

const NOTIFY_OPTIONS: { value: NotificationMode; id: string; label: string }[] = [
  { value: "all", id: "notify-all", label: "All new messages" },
  {
    value: "mentions",
    id: "notify-mentions",
    label: "Direct messages and mentions",
  },
  { value: "none", id: "notify-none", label: "Nothing" },
]

type ToggleRowProps = {
  id: string
  title: string
  description: string
  checked: boolean
  disabled?: boolean
  onCheckedChange: (checked: boolean) => void
}

function ToggleRow({
  id,
  title,
  description,
  checked,
  disabled,
  onCheckedChange,
}: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium">
          {title}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        data-testid={id}
        className="shrink-0"
      />
    </div>
  )
}

export function NotificationsForm() {
  const { control, handleSubmit } = useForm<NotificationsFormValues>({
    defaultValues: {
      type: "mentions",
      marketing: false,
      security: true,
      weekly: true,
      mobile: false,
    },
  })

  function onSubmit(values: NotificationsFormValues) {
    toast.success("Notification settings saved", {
      description: `Mode: ${values.type}`,
    })
  }

  return (
    <form
      className="max-w-2xl space-y-8"
      data-testid="notifications-form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <section className="space-y-4">
        <h3 className="text-sm font-medium">Notify me about…</h3>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="gap-3"
              aria-label="Notify me about"
            >
              {NOTIFY_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <RadioGroupItem
                    value={option.value}
                    id={option.id}
                    data-testid={option.id}
                  />
                  <Label htmlFor={option.id} className="font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        />
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium">Email notifications</h3>
        <div className="space-y-3">
          <Controller
            control={control}
            name="weekly"
            render={({ field }) => (
              <ToggleRow
                id="notify-weekly"
                title="Weekly digest"
                description="A summary of activity in your workspace, sent every Monday."
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="marketing"
            render={({ field }) => (
              <ToggleRow
                id="notify-marketing"
                title="Marketing emails"
                description="Product news, tips and occasional offers."
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="security"
            render={({ field }) => (
              <ToggleRow
                id="notify-security"
                title="Security emails"
                description="Sign-in alerts and account security notices. Always on."
                checked={field.value}
                disabled
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-start gap-3">
          <Controller
            control={control}
            name="mobile"
            render={({ field }) => (
              <Checkbox
                id="notify-mobile"
                data-testid="notify-mobile"
                className="mt-0.5"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            )}
          />
          <Label htmlFor="notify-mobile" className="text-sm font-normal">
            Use different settings for my mobile devices
          </Label>
        </div>
      </section>

      <Button type="submit" data-testid="notifications-submit">
        Update notifications
      </Button>
    </form>
  )
}
