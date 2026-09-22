"use client";

import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success"
  | "warning";

export type ButtonSize =
  | "sm"
  | "md"
  | "lg";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const variantClasses: Record<
  ButtonVariant,
  string
> = {
  primary:
    "bg-[#12213a] text-white hover:bg-[#1b2f50] focus:ring-[#12213a]/20",

  secondary:
    "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-300",

  outline:
    "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-300",

  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-200",

  danger:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-200",

  success:
    "bg-green-600 text-white hover:bg-green-700 focus:ring-green-200",

  warning:
    "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-200",
};

const sizeClasses: Record<
  ButtonSize,
  string
> = {
  sm:
    "min-h-8 px-3 text-[10px] rounded-md",

  md:
    "min-h-9 px-4 text-xs rounded-lg",

  lg:
    "min-h-11 px-5 text-sm rounded-lg",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled =
    disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading}
      className={[
        "inline-flex",
        "items-center",
        "justify-center",
        "gap-2",
        "font-semibold",
        "transition-colors",
        "duration-150",
        "focus:outline-none",
        "focus:ring-2",
        "disabled:cursor-not-allowed",
        "disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth
          ? "w-full"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}

      {loading
        ? "Loading..."
        : children}
    </button>
  );
}