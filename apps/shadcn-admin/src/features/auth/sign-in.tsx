// Showcase inspired by satnaing/shadcn-admin (MIT). https://github.com/satnaing/shadcn-admin
import { useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { CodeXml, Command, Globe, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const signInSchema = z.object({
  email: z.email("Please enter your email"),
  password: z
    .string()
    .min(7, "Password must be at least 7 characters long"),
  remember: z.boolean(),
})

type SignInValues = z.infer<typeof signInSchema>

const DECORATIVE_SQUARES = [
  "opacity-30",
  "opacity-20",
  "opacity-10",
  "opacity-20",
  "opacity-10",
  "opacity-30",
  "opacity-10",
  "opacity-30",
  "opacity-20",
]

export function SignInPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "demo@li.yishan.app",
      password: "password123",
      remember: true,
    },
  })

  const onSubmit = () => {
    setIsLoading(true)
    window.setTimeout(() => {
      setIsLoading(false)
      toast.success("Signed in (demo)")
      navigate({ to: "/" })
    }, 600)
  }

  const { errors } = form.formState

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-zinc-900 p-10 text-white lg:flex dark:border-r">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-white/10 p-1.5">
            <Command className="size-4" />
          </div>
          <span className="text-sm font-medium">Shadcn Admin</span>
        </div>

        <div className="flex items-center justify-center">
          <div className="grid grid-cols-3 gap-3">
            {DECORATIVE_SQUARES.map((opacity, index) => (
              <div
                key={index}
                className={cn("size-14 rounded-lg bg-white", opacity)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <blockquote className="text-sm text-white/80">
            “A clean, accessible admin shell — sidebar, tables, forms and
            themes — ready to drop real data into.”
          </blockquote>
          <p className="text-xs text-white/60">
            Showcase inspired by{" "}
            <a
              href="https://github.com/satnaing/shadcn-admin"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              shadcn-admin by Sat Naing
            </a>{" "}
            (MIT)
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-6 p-6">
        <div className="flex items-center gap-2 lg:hidden">
          <div className="rounded-md bg-primary p-1.5 text-primary-foreground">
            <Command className="size-4" />
          </div>
          <span className="text-sm font-medium">Shadcn Admin</span>
        </div>

        <Card className="w-full max-w-sm" data-testid="signin-card">
          <CardHeader>
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>
              Enter your email and password below to log into your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-4"
              noValidate
            >
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  data-testid="signin-email"
                  aria-invalid={Boolean(errors.email)}
                  {...form.register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                    onClick={() => toast("Password reset is mocked")}
                    data-testid="signin-forgot-password"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  data-testid="signin-password"
                  aria-invalid={Boolean(errors.password)}
                  {...form.register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Controller
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <Checkbox
                      id="remember"
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                      data-testid="signin-remember"
                    />
                  )}
                />
                <Label htmlFor="remember" className="font-normal">
                  Remember me
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="signin-submit"
              >
                {isLoading && <Loader2 className="animate-spin" />}
                Sign in
              </Button>

              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-2 text-xs text-muted-foreground uppercase">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => toast("Social login is mocked")}
                  data-testid="signin-github"
                >
                  <CodeXml />
                  GitHub
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => toast("Social login is mocked")}
                  data-testid="signin-google"
                >
                  <Globe />
                  Google
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex-col items-start gap-1">
            <p className="text-xs text-muted-foreground">
              Demo only — no data leaves your browser.
            </p>
            <Link
              to="/"
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Back to dashboard
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
