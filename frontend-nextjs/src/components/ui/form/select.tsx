import type { ComponentProps } from "react";
import { controlClasses, controlSizeClasses, type ControlSize } from "./form-classes";

export type SelectProps = Omit<ComponentProps<"select">, "size"> & {
  size?: ControlSize;
  isError?: boolean;
};

export function Select({
  className = "",
  size = "md",
  isError = false,
  "aria-invalid": ariaInvalid,
  ...props
}: SelectProps) {
  return (
    <select
      {...props}
      aria-invalid={isError ? true : ariaInvalid}
      className={`${controlClasses} ${controlSizeClasses[size]} ${className}`}
    />
  );
}
