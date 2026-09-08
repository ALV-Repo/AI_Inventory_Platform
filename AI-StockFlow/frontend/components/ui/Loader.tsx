"use client";

import type { HTMLAttributes } from "react";

export interface LoaderProps
  extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: {
    spinner: "h-4 w-4 border-2",
    text: "text-[10px]",
  },
  md: {
    spinner: "h-6 w-6 border-2",
    text: "text-xs",
  },
  lg: {
    spinner: "h-8 w-8 border-[3px]",
    text: "text-sm",
  },
};

export default function Loader({
  size = "md",
  text,
  fullScreen = false,
  className = "",
  ...props
}: LoaderProps) {
  const selectedSize =
    sizeClasses[size];

  const content = (
    <div
      className={`flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      <span
        aria-hidden="true"
        className={`animate-spin rounded-full border-gray-200 border-t-[#12213a] ${selectedSize.spinner}`}
      />

      {text && (
        <span
          className={`font-medium text-gray-500 ${selectedSize.text}`}
        >
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}

export function LoadingSpinner({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const selectedSize =
    sizeClasses[size];

  return (
    <span
      aria-label="Loading"
      role="status"
      className={`inline-block animate-spin rounded-full border-gray-200 border-t-[#12213a] ${selectedSize.spinner} ${className}`}
    />
  );
}

export function LoadingState({
  text = "Loading...",
  className = "",
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-[160px] items-center justify-center ${className}`}
    >
      <Loader
        size="md"
        text={text}
      />
    </div>
  );
}