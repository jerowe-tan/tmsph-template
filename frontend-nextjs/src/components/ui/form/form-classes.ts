export const controlClasses =
  "block w-full min-w-0 border border-border rounded-[var(--radius-control)] bg-surface text-foreground leading-normal transition-colors duration-[var(--motion-fast)] placeholder:text-muted read-only:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-muted aria-invalid:border-error aria-invalid:outline-error [@media(hover:hover)]:enabled:hover:border-foreground read-only:hover:border-border aria-invalid:hover:border-error focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-focus focus-visible:shadow-[0_0_0_3px_var(--surface)] motion-reduce:transition-none";

export type ControlSize = "sm" | "md" | "lg";

export const controlSizeClasses: Record<ControlSize, string> = {
  sm: "min-h-[var(--control-height)] px-2.5 py-2 text-sm",
  md: "min-h-[var(--control-height)] px-3 py-2.5 text-base",
  lg: "min-h-12 px-4 py-3 text-lg",
};

export const choiceClasses =
  "size-5 shrink-0 align-middle accent-brand-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed aria-invalid:outline-error aria-invalid:border-error data-[error=true]:border-error data-[error=true]:outline data-[error=true]:outline-error focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-focus";

export const fieldClasses = "grid min-w-0";

export type FieldGap = "gap-0" | "gap-1" | "gap-2" | "gap-3" | "gap-4" | "gap-6";
export const labelClasses = "text-foreground text-sm font-semibold";
export const requiredClasses = "text-muted font-normal";
export const hintClasses = "m-0 text-sm break-words text-muted";
export const formErrorClasses = "m-0 text-sm break-words text-error";
export const textareaClasses = "resize-y min-h-28";
