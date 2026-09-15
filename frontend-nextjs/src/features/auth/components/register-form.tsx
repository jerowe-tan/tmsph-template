import { Button } from "@/components/ui/button/button";
import { FieldError } from "@/components/ui/form/field-error";
import { LabeledInput } from "@/components/ui/form/labeled-input";

export function RegisterForm() {
  return (
    <form className="grid gap-2">
      <div className="">
        <LabeledInput
          id="email"
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          aria-describedby="email-error"
          gap="gap-1"
          isError={true}
        />
        <FieldError id="email-error" />
      </div>
      <div className="">
        <LabeledInput
          id="password"
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Create a password"
          aria-describedby="password-error"
          gap="gap-1"
        />
        <FieldError id="password-error"/>
      </div>
      <div className="">
        <LabeledInput
          id="confirm-password"
          label="Confirm password"
          name="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Re-enter your password"
          aria-describedby="confirm-password-error"
          gap="gap-1"
        />
        <FieldError id="confirm-password-error" />
      </div>
      <hr className="invisible my-1" />
      <Button type="submit" className="w-full">
        Create account
      </Button>
    </form>
  );
}
