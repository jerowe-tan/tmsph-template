import Link from "next/link";
import { Card } from "@/components/ui/card/card";
import { RegisterForm } from "@/features/auth/components/register-form";
import { createPrivateMetadata } from "@/lib/metadata";

export const metadata = createPrivateMetadata({
  title: "Create account",
  description: "Create your Toyota account to access connected services.",
});

export default function RegisterPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-surface-muted px-4 py-12">
      <Card className="grid w-full max-w-md gap-6">
        <div className="grid gap-2">
          <p className="text-sm font-semibold text-muted">Toyota</p>
          <h1 className="text-3xl font-bold leading-tight">Create account</h1>
          <p className="text-sm text-muted">
            Set up your Toyota account to access connected services.
          </p>
        </div>
        <RegisterForm />
        <p className="border-t border-divider pt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
