import type { ComponentProps } from "react";

const baseClasses =
  "min-w-0 p-6 border border-divider rounded-[var(--radius-card)] bg-surface text-foreground break-words";

export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return <div {...props} className={`${baseClasses} ${className}`} />;
}
