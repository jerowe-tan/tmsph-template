export const toneClasses = {
  neutral: "text-muted bg-surface-muted",
  success: "text-success bg-success-surface",
  warning: "text-warning bg-warning-surface",
  error: "text-error bg-error-surface",
  info: "text-info bg-info-surface",
} as const;

export type Tone = keyof typeof toneClasses;
