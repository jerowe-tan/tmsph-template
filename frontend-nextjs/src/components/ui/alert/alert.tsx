import type { ComponentProps } from "react";
import { toneClasses } from "../tones";

export type AlertProps = ComponentProps<"div"> & {
  tone?: "info" | "success" | "warning" | "error";
};

const baseClasses =
  "p-4 border border-current border-s-4 rounded-[var(--radius-control)] text-sm leading-normal break-words";

export function Alert({ tone = "info", className = "", ...props }: AlertProps) {
  return <div role="status" {...props} className={`${baseClasses} ${toneClasses[tone]} ${className}`} />;
}
