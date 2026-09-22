"use client";

import type {
  HTMLAttributes,
  MouseEvent,
  ReactNode,
} from "react";

export interface ModalProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "title"
  > {
  open?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

export default function Modal({
  open,
  isOpen,
  onClose,
  title,
  children,
  footer,
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = "",
  ...props
}: ModalProps) {
  const visible = isOpen ?? open ?? false;

  if (!visible) {
    return null;
  }

  const handleOverlayClick = (
    event: MouseEvent<HTMLDivElement>
  ) => {
    if (
      closeOnOverlayClick &&
      event.target === event.currentTarget
    ) {
      onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={handleOverlayClick}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-xl ${className}`}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
        {...props}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div className="min-w-0 flex-1">
              {title && (
                <h2 className="text-sm font-bold text-[#12213a]">
                  {title}
                </h2>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-5 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}