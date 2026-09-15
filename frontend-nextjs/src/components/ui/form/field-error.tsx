import type { ComponentProps, ReactNode } from "react";

export type FieldErrorProps = Omit<ComponentProps<"p">, "children"> & {
  error?: ReactNode;
  size?: "sm" | "md" | "lg";
};

// Always mounted with one reserved line (per size) so toggling an error
// never shifts layout. Hidden via `invisible` (keeps its space) until
// `error` is set.
const baseClasses = "m-0 break-words text-error";

const sizeClasses: Record<NonNullable<FieldErrorProps["size"]>, string> = {
  sm: "text-xs min-h-3.5",
  md: "text-sm min-h-5",
  lg: "text-base min-h-8",
};

export function FieldError({
  error,
  size = "md",
  className = "",
  ...props
}: FieldErrorProps) {
  const isError = error !== undefined && error !== null && error !== "";
  return (
    <p
      aria-live="polite"
      {...props}
      className={`${baseClasses} ${sizeClasses[size]} ${isError ? "" : "invisible"} ${className}`}
    >
      {error}
    </p>
  );
}
