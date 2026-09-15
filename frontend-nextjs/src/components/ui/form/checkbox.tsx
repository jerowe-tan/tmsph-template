import type { ComponentProps } from "react";
import { choiceClasses } from "./form-classes";

export type CheckboxProps = Omit<ComponentProps<"input">, "type"> & {
  isError?: boolean;
};

export function Checkbox({
  className = "",
  isError = false,
  "aria-invalid": ariaInvalid,
  ...props
}: CheckboxProps) {
  return (
    <input
      {...props}
      type="checkbox"
      aria-invalid={isError ? true : ariaInvalid}
      className={`${choiceClasses} ${className}`}
    />
  );
}
