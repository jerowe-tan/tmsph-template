import type { ComponentProps } from "react";
import { typographyMarginClasses, type TypographyMargin } from "./typography-classes";

export type QuoteProps = ComponentProps<"blockquote"> & {
  size?: "sm" | "md" | "lg";
  margin?: TypographyMargin;
};

const baseClasses = "border-s-4 border-brand-primary ps-4 leading-relaxed break-words";

const sizeClasses: Record<NonNullable<QuoteProps["size"]>, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
};

export function Quote({
  size = "md",
  margin = "sm",
  className = "",
  ...props
}: QuoteProps) {
  return (
    <blockquote
      {...props}
      className={`${baseClasses} ${sizeClasses[size]} ${typographyMarginClasses[margin]} ${className}`}
    />
  );
}
