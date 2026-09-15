import type { ComponentProps } from "react";
import { typographyMarginClasses, type TypographyMargin } from "./typography-classes";

export type DisplayProps = ComponentProps<"h1"> & {
  size?: "sm" | "md" | "lg";
  margin?: TypographyMargin;
};

const baseClasses = "font-bold leading-tight break-words";

const sizeClasses: Record<NonNullable<DisplayProps["size"]>, string> = {
  sm: "text-[1.75rem]",
  md: "text-3xl",
  lg: "text-[2.5rem]",
};

export function Display({ size = "md", margin = "sm", className = "", ...props }: DisplayProps) {
  return (
    <h1
      {...props}
      className={`${baseClasses} ${sizeClasses[size]} ${typographyMarginClasses[margin]} ${className}`}
    />
  );
}
