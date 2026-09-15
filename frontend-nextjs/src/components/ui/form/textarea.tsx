import type { ComponentProps } from "react";
import {
  controlClasses,
  controlSizeClasses,
  textareaClasses,
  type ControlSize,
} from "./form-classes";

export type TextareaProps = ComponentProps<"textarea"> & {
  size?: ControlSize;
  isError?: boolean;
};

export function Textarea({
  className = "",
  rows = 4,
  size = "md",
  isError = false,
  "aria-invalid": ariaInvalid,
  ...props
}: TextareaProps) {
  return (
    <textarea
      {...props}
      rows={rows}
      aria-invalid={isError ? true : ariaInvalid}
      className={`${controlClasses} ${controlSizeClasses[size]} ${textareaClasses} ${className}`}
    />
  );
}
