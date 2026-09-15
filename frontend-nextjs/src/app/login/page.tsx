import Link from "next/link";
import { Card } from "@/components/ui/card/card";
import { LoginForm } from "@/features/auth/components/login-form";
import { createPrivateMetadata } from "@/lib/metadata";

export const metadata = createPrivateMetadata({
  title: "Sign in",
  description: "Sign in to access your Toyota account and connected services.",
});

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-surface-muted px-4 py-12">
      <Card className="grid w-full max-w-md gap-6">
        <div className="grid gap-2">
          <p className="text-sm font-semibold text-muted">Toyota</p>
          <h1 className="text-3xl font-bold leading-tight">Sign in</h1>
          <p className="text-sm text-muted">
            Access your Toyota account and connected services.
          </p>
        </div>
        <LoginForm />
        <p className="border-t border-divider pt-4 text-center text-sm text-muted">
          New to Toyota?{" "}
          <Link href="/register" className="font-semibold underline underline-offset-2">
            Create an account
          </Link>
        </p>
      </Card>
    </main>
  );
}
