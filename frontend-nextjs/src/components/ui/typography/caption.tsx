import type { ComponentProps } from "react";
import { typographyMarginClasses, type TypographyMargin } from "./typography-classes";

export type CaptionProps = ComponentProps<"p"> & {
  size?: "sm" | "md" | "lg";
  margin?: TypographyMargin;
};

const baseClasses = "text-muted leading-normal break-words";

const sizeClasses: Record<NonNullable<CaptionProps["size"]>, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function Caption({
  size = "md",
  margin = "sm",
  className = "",
  ...props
}: CaptionProps) {
  return (
    <p
      {...props}
      className={`${baseClasses} ${sizeClasses[size]} ${typographyMarginClasses[margin]} ${className}`}
    />
  );
}
