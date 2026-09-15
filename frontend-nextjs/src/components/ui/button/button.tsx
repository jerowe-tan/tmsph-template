import type { ComponentProps } from "react";
import { Spinner } from "../spinner/spinner";

export type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export const buttonBaseClasses =
  "inline-flex items-center justify-center gap-2 min-h-[var(--control-height)] min-w-[var(--control-height)] max-w-full px-5 py-2.5 border border-transparent rounded-[var(--radius-control)] font-semibold leading-normal text-center break-words cursor-pointer transition-colors duration-[var(--motion-fast)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-focus focus-visible:shadow-[0_0_0_3px_var(--surface)] motion-reduce:transition-none";

export const buttonVariantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-brand-primary text-brand-on-primary hover:bg-brand-primary-hover active:bg-brand-primary-active",
  secondary:
    "bg-brand-secondary text-brand-on-secondary hover:bg-muted active:bg-black",
  outline:
    "border-current bg-transparent text-foreground hover:bg-surface-muted active:bg-divider",
  ghost:
    "bg-transparent text-foreground hover:bg-surface-muted active:bg-divider",
};

export const buttonSizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3.5 text-sm",
  md: "text-base",
  lg: "min-h-12 px-6 py-3 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  type = "button",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || props["aria-busy"]}
      className={`${buttonBaseClasses} ${buttonVariantClasses[variant]} ${buttonSizeClasses[size]} ${className}`}
    >
      {loading && <Spinner aria-hidden="true" />}
      {children}
    </button>
  );
}
