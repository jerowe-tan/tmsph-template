import type { ComponentProps } from "react";
import { toneClasses, type Tone } from "../tones";

export type BadgeProps = ComponentProps<"span"> & {
  tone?: Tone;
  size?: "sm" | "md" | "lg";
};

const baseClasses =
  "inline-flex border border-current rounded-[var(--radius-control)] font-semibold leading-normal";

const sizeClasses: Record<NonNullable<BadgeProps["size"]>, string> = {
  sm: "px-1.5 py-px text-xs",
  md: "px-2 py-0.5 text-xs",
  lg: "px-2.5 py-1 text-sm",
};

export function Badge({ tone = "neutral", size = "md", className = "", ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={`${baseClasses} ${sizeClasses[size]} ${toneClasses[tone]} ${className}`}
    />
  );
}
