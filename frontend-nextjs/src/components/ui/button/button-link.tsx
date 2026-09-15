import Link from "next/link";
import type { ComponentProps } from "react";
import {
  buttonBaseClasses,
  buttonSizeClasses,
  buttonVariantClasses,
  type ButtonProps,
} from "./button";

export type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  isActive?: boolean;
};

// Persistent "current page" look. Keyed off `[aria-current=page]` (higher
// specificity than the plain background utilities), so it always wins
// regardless of Tailwind's class ordering.
const linkActiveClasses: Record<
  NonNullable<ButtonProps["variant"]>,
  string
> = {
  primary: "[aria-current=page]:bg-brand-primary-active",
  secondary: "[aria-current=page]:bg-black",
  outline: "[aria-current=page]:bg-divider",
  ghost: "[aria-current=page]:bg-divider",
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  isActive = false,
  className = "",
  children,
  "aria-current": ariaCurrent,
  ...props
}: ButtonLinkProps) {
  // The shared maps use plain `hover:`/`active:` selectors that match any
  // element, so links get them verbatim — no qualifier to strip.
  return (
    <Link
      {...props}
      aria-current={isActive ? "page" : ariaCurrent}
      className={`${buttonBaseClasses} ${buttonVariantClasses[variant]} ${linkActiveClasses[variant]} ${buttonSizeClasses[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
