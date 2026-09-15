import type { ComponentProps } from "react";
import { labelClasses, requiredClasses } from "./form-classes";

export type LabelProps = ComponentProps<"label"> & { required?: boolean };

export function Label({ required, children, className = "", ...props }: LabelProps) {
  return (
    <label {...props} className={`${labelClasses} ${className}`}>
      {children}
      {required && <span className={requiredClasses}> (required)</span>}
    </label>
  );
}
