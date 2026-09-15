import type { ComponentProps } from "react";
import { typographyMarginClasses, type TypographyMargin } from "./typography-classes";

export type BodyProps = ComponentProps<"p"> & {
  size?: "sm" | "md" | "lg";
  margin?: TypographyMargin;
};

const baseClasses = "leading-normal break-words";

const sizeClasses: Record<NonNullable<BodyProps["size"]>, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function Body({ size = "md", margin = "sm", className = "", ...props }: BodyProps) {
  return (
    <p
      {...props}
      className={`${baseClasses} ${sizeClasses[size]} ${typographyMarginClasses[margin]} ${className}`}
    />
  );
}
