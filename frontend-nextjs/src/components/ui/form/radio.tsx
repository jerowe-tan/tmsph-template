import type { ComponentProps } from "react";
import { choiceClasses } from "./form-classes";

export type RadioProps = Omit<ComponentProps<"input">, "type"> & {
  isError?: boolean;
};

// Radios expose their invalid state on the group (fieldset), not the option,
// so `isError` styles via `data-error` instead of `aria-invalid`.
export function Radio({ className = "", isError = false, ...props }: RadioProps) {
  return (
    <input
      {...props}
      type="radio"
      data-error={isError || undefined}
      className={`${choiceClasses} ${className}`}
    />
  );
}
