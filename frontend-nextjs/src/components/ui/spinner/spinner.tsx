import type { ComponentProps } from "react";

const baseClasses =
  "inline-block size-[1em] shrink-0 rounded-full border-2 border-current border-e-transparent animate-[spin_700ms_linear_infinite] motion-reduce:animate-none";

export function Spinner({ className = "", ...props }: ComponentProps<"span">) {
  return (
    <span
      role="status"
      aria-label="Loading"
      {...props}
      className={`${baseClasses} ${className}`}
    />
  );
}
