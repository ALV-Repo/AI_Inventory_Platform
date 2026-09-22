"use client";

import type {
  HTMLAttributes,
  ReactNode,
} from "react";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple";

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<
  BadgeVariant,
  string
> = {
  default:
    "bg-gray-100 text-gray-700",
  success:
    "bg-green-100 text-green-700",
  warning:
    "bg-amber-100 text-amber-700",
  danger:
    "bg-red-100 text-red-700",
  info:
    "bg-blue-100 text-blue-700",
  purple:
    "bg-purple-100 text-purple-700",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-4 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}