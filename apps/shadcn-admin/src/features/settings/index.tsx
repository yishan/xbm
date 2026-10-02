// Showcase inspired by satnaing/shadcn-admin (MIT). https://github.com/satnaing/shadcn-admin
import { useState } from "react"
import { Bell, Palette, UserCog } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { AppearanceForm } from "./appearance-form"
import { NotificationsForm } from "./notifications-form"
import { ProfileForm } from "./profile-form"

type SectionKey = "profile" | "appearance" | "notifications"

type SettingsNavItem = {
  key: SectionKey
  label: string
  icon: typeof UserCog
}

const navItems: SettingsNavItem[] = [
  { key: "profile", label: "Profile", icon: UserCog },
  { key: "appearance", label: "Appearance", icon: Palette },
  { key: "notifications", label: "Notifications", icon: Bell },
]

const sectionContent: Record<SectionKey, { title: string; description: string }> = {
  profile: {
    title: "Profile",
    description: "This is how others will see you on the site.",
  },
  appearance: {
    title: "Appearance",
    description:
      "Customize the look of the dashboard. Switch between light and dark.",
  },
  notifications: {
    title: "Notifications",
    description: "Configure how you receive notifications.",
  },
}

export function SettingsPage() {
  const [section, setSection] = useState<SectionKey>("profile")

  const { title, description } = sectionContent[section]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile and preferences.
        </p>
      </div>

      <Separator />

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <aside className="flex shrink-0 flex-row gap-1 overflow-x-auto lg:w-48 lg:flex-col">
          {navItems.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              type="button"
              variant="ghost"
              data-testid={`settings-nav-${key}`}
              onClick={() => setSection(key)}
              className={cn(
                "shrink-0 justify-start lg:w-full",
                section === key && "bg-muted"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Button>
          ))}
        </aside>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-medium">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>

          <Separator className="my-4" />

          {section === "profile" && <ProfileForm />}
          {section === "appearance" && <AppearanceForm />}
          {section === "notifications" && <NotificationsForm />}
        </div>
      </div>
    </div>
  )
}
