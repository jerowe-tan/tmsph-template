import type { ComponentProps } from "react";
import { typographyMarginClasses, type TypographyMargin } from "./typography-classes";

export type HeadingProps = Omit<ComponentProps<"h1">, "size"> & {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: "sm" | "md" | "lg";
  margin?: TypographyMargin;
};

const baseClasses = "font-semibold leading-tight break-words";

const sizeClasses: Record<NonNullable<HeadingProps["size"]>, string> = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

export function Heading({
  level = 2,
  size = "md",
  margin = "sm",
  className = "",
  ...props
}: HeadingProps) {
  const Tag = `h${level}` as const;
  return (
    <Tag
      {...props}
      className={`${baseClasses} ${sizeClasses[size]} ${typographyMarginClasses[margin]} ${className}`}
    />
  );
}
