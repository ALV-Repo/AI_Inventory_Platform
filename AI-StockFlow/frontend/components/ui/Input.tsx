"use client";

import type {
  InputHTMLAttributes,
  ReactNode,
} from "react";

export interface InputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "size"
  > {
  label?: ReactNode;
  error?: string;
  helperText?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
  className?: string;
}

export default function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerClassName = "",
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId =
    id ??
    (typeof label === "string"
      ? label
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-_]/g, "")
      : undefined);

  return (
    <div
      className={`w-full ${containerClassName}`}
    >
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-gray-500"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          className={[
            "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900",
            "outline-none transition",
            "placeholder:text-gray-400",
            "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500",
            leftIcon
              ? "pl-10"
              : "",
            rightIcon
              ? "pr-10"
              : "",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </span>
        )}
      </div>

      {error ? (
        <p
          id={
            inputId
              ? `${inputId}-error`
              : undefined
          }
          className="mt-1.5 text-[10px] font-medium text-red-600"
        >
          {error}
        </p>
      ) : helperText ? (
        <p
          id={
            inputId
              ? `${inputId}-helper`
              : undefined
          }
          className="mt-1.5 text-[10px] text-gray-400"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}