import type { ComponentProps } from "react";
import { typographyMarginClasses, type TypographyMargin } from "./typography-classes";

export type EyebrowProps = ComponentProps<"p"> & {
  size?: "sm" | "md" | "lg";
  margin?: TypographyMargin;
};

// Short kicker above a heading. Sentence case per brand voice; uppercase is
// reserved for short expressive headings and set explicitly via className.
const baseClasses = "font-semibold leading-normal break-words text-muted";

const sizeClasses: Record<NonNullable<EyebrowProps["size"]>, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function Eyebrow({
  size = "md",
  margin = "sm",
  className = "",
  ...props
}: EyebrowProps) {
  return (
    <p
      {...props}
      className={`${baseClasses} ${sizeClasses[size]} ${typographyMarginClasses[margin]} ${className}`}
    />
  );
}
