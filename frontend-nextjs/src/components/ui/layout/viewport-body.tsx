import type { ComponentProps } from "react";

export type ViewportBodyProps = ComponentProps<"div"> & {
  size?: "sm" | "md" | "lg" | "full";
};

// Page-level wrapper: centered content with gutters that widen as the
// viewport grows (16px → 24px from xs → 32px from lg).
const baseClasses = "mx-auto w-full px-4 xs:px-6 lg:px-8";

const sizeClasses: Record<NonNullable<ViewportBodyProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-3xl",
  lg: "max-w-7xl",
  full: "max-w-none",
};

export function ViewportBody({ size = "lg", className = "", ...props }: ViewportBodyProps) {
  return <div {...props} className={`${baseClasses} ${sizeClasses[size]} ${className}`} />;
}
