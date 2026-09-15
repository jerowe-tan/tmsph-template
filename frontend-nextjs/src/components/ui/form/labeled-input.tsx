"use client";

import { useId, type ReactNode } from "react";
import { Input, type InputProps } from "./input";
import { Label } from "./label";
import { fieldClasses, formErrorClasses, hintClasses, type FieldGap } from "./form-classes";

export type LabeledInputProps = InputProps & {
  label: ReactNode;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
  gap?: FieldGap;
};

export function LabeledInput({
  id,
  label,
  hint,
  error,
  required,
  wrapperClassName = "",
  gap = "gap-2",
  isError = false,
  "aria-describedby": describedBy,
  ...props
}: LabeledInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionIds = [
    describedBy,
    hint ? `${inputId}-hint` : undefined,
    error ? `${inputId}-error` : undefined,
  ].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`${fieldClasses} ${gap} ${wrapperClassName}`}>
      <Label htmlFor={inputId} required={required}>{label}</Label>
      <Input
        {...props}
        id={inputId}
        required={required}
        isError={isError || Boolean(error)}
        aria-invalid={props["aria-invalid"]}
        aria-describedby={descriptionIds}
      />
      {hint && <p id={`${inputId}-hint`} className={hintClasses}>{hint}</p>}
      {error && <p id={`${inputId}-error`} className={formErrorClasses}>{error}</p>}
    </div>
  );
}
