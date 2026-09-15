import type { ComponentProps } from "react";
import { controlClasses, controlSizeClasses, type ControlSize } from "./form-classes";

export type InputProps = Omit<ComponentProps<"input">, "size"> & {
  size?: ControlSize;
  isError?: boolean;
};

export function Input({
  className = "",
  type = "text",
  size = "md",
  isError = false,
  "aria-invalid": ariaInvalid,
  ...props
}: InputProps) {
  return (
    <input
      {...props}
      type={type}
      aria-invalid={isError ? true : ariaInvalid}
      className={`${controlClasses} ${controlSizeClasses[size]} ${className}`}
    />
  );
}
