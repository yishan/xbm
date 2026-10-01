// Showcase inspired by satnaing/shadcn-admin (MIT). https://github.com/satnaing/shadcn-admin
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const profileSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters.")
    .max(30, "Username must be at most 30 characters."),
  email: z.email("Please enter a valid email."),
  bio: z.string().max(160, "Bio must be at most 160 characters."),
  role: z.enum(["admin", "editor", "viewer"]),
  website: z.url("Enter a valid URL.").or(z.literal("")),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "yishan",
      email: "demo@li.yishan.app",
      bio: "Building one demo a night.",
      role: "admin",
      website: "https://li.yishan.app",
    },
  })

  const { errors, isSubmitting } = form.formState
  const bioLength = form.watch("bio").length

  function onSubmit(values: ProfileFormValues) {
    toast.success("Profile updated", {
      description: `Saved @${values.username}`,
    })
  }

  return (
    <form
      className="space-y-6 max-w-xl"
      data-testid="profile-form"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          autoComplete="username"
          data-testid="profile-username"
          {...form.register("username")}
        />
        <p className="text-xs text-muted-foreground">
          This is your public display name.
        </p>
        {errors.username ? (
          <p className="text-xs text-destructive">{errors.username.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          data-testid="profile-email"
          {...form.register("email")}
        />
        {errors.email ? (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Controller
          control={form.control}
          name="role"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="role"
                ref={field.ref}
                className="w-full sm:w-[220px]"
                data-testid="profile-role"
                onBlur={field.onBlur}
              >
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.role ? (
          <p className="text-xs text-destructive">{errors.role.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          inputMode="url"
          placeholder="https://example.com"
          data-testid="profile-website"
          {...form.register("website")}
        />
        {errors.website ? (
          <p className="text-xs text-destructive">{errors.website.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="bio">Bio</Label>
          <span className="text-xs text-muted-foreground tabular-nums">
            {bioLength}/160
          </span>
        </div>
        <Textarea
          id="bio"
          rows={3}
          data-testid="profile-bio"
          {...form.register("bio")}
        />
        {errors.bio ? (
          <p className="text-xs text-destructive">{errors.bio.message}</p>
        ) : null}
      </div>

      <Button type="submit" data-testid="profile-submit" disabled={isSubmitting}>
        Update profile
      </Button>
    </form>
  )
}
