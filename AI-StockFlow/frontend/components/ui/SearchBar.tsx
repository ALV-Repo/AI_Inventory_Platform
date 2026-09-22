"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

export interface SearchBarProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange"
  > {
  value?: string;
  onChange?: (
    value: string
  ) => void;
  onSearch?: (
    value: string
  ) => void;
  placeholder?: string;
  leftIcon?: ReactNode;
  rightContent?: ReactNode;
  debounceMs?: number;
  containerClassName?: string;
  className?: string;
  showClear?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  leftIcon,
  rightContent,
  debounceMs = 0,
  containerClassName = "",
  className = "",
  showClear = true,
  ...props
}: SearchBarProps) {
  const [internalValue, setInternalValue] =
    useState(value ?? "");

  const currentValue =
    value !== undefined
      ? value
      : internalValue;

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (
      debounceMs <= 0 ||
      !onSearch
    ) {
      return;
    }

    const timer = window.setTimeout(
      () => {
        onSearch(currentValue);
      },
      debounceMs
    );

    return () =>
      window.clearTimeout(timer);
  }, [
    currentValue,
    debounceMs,
    onSearch,
  ]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const nextValue =
      event.target.value;

    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);

    if (debounceMs <= 0) {
      onSearch?.(nextValue);
    }
  };

  const handleClear = () => {
    if (value === undefined) {
      setInternalValue("");
    }

    onChange?.("");
    onSearch?.("");
  };

  const handleSubmit = (
    event: React.FormEvent
  ) => {
    event.preventDefault();
    onSearch?.(currentValue);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative w-full ${containerClassName}`}
    >
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-3 text-gray-400">
          {leftIcon ?? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
              />
              <path d="m20 20-4-4" />
            </svg>
          )}
        </span>

        <input
          {...props}
          type="search"
          value={currentValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={[
            "w-full rounded-lg border border-gray-200 bg-white",
            "py-2.5 pl-10 text-sm text-gray-900",
            "outline-none transition",
            "placeholder:text-gray-400",
            "focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
            "disabled:cursor-not-allowed disabled:bg-gray-100",
            showClear &&
            currentValue
              ? "pr-20"
              : rightContent
                ? "pr-12"
                : "pr-3",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        />

        {showClear &&
          currentValue && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="absolute right-10 flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          )}

        {rightContent && (
          <div className="absolute right-2 flex items-center">
            {rightContent}
          </div>
        )}
      </div>
    </form>
  );
}