import { Button } from "@/components/ui/button/button";
import { Checkbox } from "@/components/ui/form/checkbox";
import { Label } from "@/components/ui/form/label";
import { LabeledInput } from "@/components/ui/form/labeled-input";

export function LoginForm() {
  return (
    <form className="grid gap-4">
      <LabeledInput
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        required
        placeholder="you@example.com"
        gap="gap-1"
      />
      <LabeledInput
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        placeholder="Enter your password"
        gap="gap-1"
      />
      <div className="flex items-center justify-between gap-4">
        <Label className="flex min-h-11 items-center gap-2">
          <Checkbox name="remember" />
          Remember me
        </Label>
        <a
          href="#"
          className="text-sm font-semibold underline underline-offset-2"
        >
          Forgot password?
        </a>
      </div>
      <Button type="submit" className="w-full">
        Sign in
      </Button>
    </form>
  );
}
