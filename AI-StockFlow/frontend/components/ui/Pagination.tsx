"use client";

import type { ReactNode } from "react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;

  className?: string;

  showPageNumbers?: boolean;
  siblingCount?: number;

  previousLabel?: ReactNode;
  nextLabel?: ReactNode;

  disabled?: boolean;
}

function getPageNumbers(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): Array<number | "ellipsis"> {
  if (totalPages <= 1) {
    return [1];
  }

  const safeSiblingCount = Math.max(
    0,
    Math.floor(siblingCount)
  );

  const totalVisibleNumbers =
    safeSiblingCount * 2 + 5;

  if (
    totalPages <= totalVisibleNumbers
  ) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1
    );
  }

  const leftSibling = Math.max(
    currentPage - safeSiblingCount,
    1
  );

  const rightSibling = Math.min(
    currentPage + safeSiblingCount,
    totalPages
  );

  const showLeftEllipsis =
    leftSibling > 2;

  const showRightEllipsis =
    rightSibling < totalPages - 1;

  if (
    !showLeftEllipsis &&
    showRightEllipsis
  ) {
    const leftItemCount =
      3 + safeSiblingCount * 2;

    return [
      ...Array.from(
        {
          length: leftItemCount,
        },
        (_, index) => index + 1
      ),
      "ellipsis",
      totalPages,
    ];
  }

  if (
    showLeftEllipsis &&
    !showRightEllipsis
  ) {
    const rightItemCount =
      3 + safeSiblingCount * 2;

    return [
      1,
      "ellipsis",
      ...Array.from(
        {
          length: rightItemCount,
        },
        (_, index) =>
          totalPages -
          rightItemCount +
          index +
          1
      ),
    ];
  }

  return [
    1,
    "ellipsis",
    ...Array.from(
      {
        length:
          rightSibling -
          leftSibling +
          1,
      },
      (_, index) =>
        leftSibling + index
    ),
    "ellipsis",
    totalPages,
  ];
}

function clampPage(
  page: number,
  totalPages: number
) {
  if (totalPages <= 0) {
    return 1;
  }

  return Math.min(
    Math.max(page, 1),
    totalPages
  );
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  showPageNumbers = true,
  siblingCount = 1,
  previousLabel = "Previous",
  nextLabel = "Next",
  disabled = false,
}: PaginationProps) {
  const safeTotalPages = Math.max(
    1,
    Math.floor(totalPages || 1)
  );

  const safeCurrentPage = clampPage(
    Math.floor(currentPage || 1),
    safeTotalPages
  );

  const pages = getPageNumbers(
    safeCurrentPage,
    safeTotalPages,
    siblingCount
  );

  const goToPage = (page: number) => {
    if (disabled) {
      return;
    }

    const nextPage = clampPage(
      page,
      safeTotalPages
    );

    if (
      nextPage === safeCurrentPage
    ) {
      return;
    }

    onPageChange(nextPage);
  };

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-wrap items-center justify-between gap-3 ${className}`}
    >
      {/* Previous */}

      <button
        type="button"
        onClick={() =>
          goToPage(
            safeCurrentPage - 1
          )
        }
        disabled={
          disabled ||
          safeCurrentPage <= 1
        }
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
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
          <path d="m15 18-6-6 6-6" />
        </svg>

        {previousLabel}
      </button>

      {/* Page Numbers */}

      {showPageNumbers && (
        <div className="flex items-center gap-1">
          {pages.map(
            (page, index) => {
              if (
                page === "ellipsis"
              ) {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="flex h-8 min-w-8 items-center justify-center px-1 text-xs text-gray-400"
                    aria-hidden="true"
                  >
                    …
                  </span>
                );
              }

              const active =
                page ===
                safeCurrentPage;

              return (
                <button
                  key={page}
                  type="button"
                  onClick={() =>
                    goToPage(page)
                  }
                  disabled={disabled}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  aria-label={`Go to page ${page}`}
                  className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-[10px] font-semibold transition ${
                    active
                      ? "bg-[#12213a] text-white"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  {page}
                </button>
              );
            }
          )}
        </div>
      )}

      {/* Next */}

      <button
        type="button"
        onClick={() =>
          goToPage(
            safeCurrentPage + 1
          )
        }
        disabled={
          disabled ||
          safeCurrentPage >=
            safeTotalPages
        }
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {nextLabel}

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
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </nav>
  );
}

/* ------------------------------------------------------------------
 * Simple compact pagination
 * ---------------------------------------------------------------- */

export interface SimplePaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
}

export function SimplePagination({
  page,
  totalPages,
  onChange,
  disabled = false,
  className = "",
}: SimplePaginationProps) {
  const safeTotalPages = Math.max(
    1,
    Math.floor(totalPages || 1)
  );

  const safePage = clampPage(
    Math.floor(page || 1),
    safeTotalPages
  );

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
    >
      <button
        type="button"
        onClick={() =>
          onChange(
            Math.max(
              1,
              safePage - 1
            )
          )
        }
        disabled={
          disabled || safePage === 1
        }
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      <span className="text-xs text-gray-500">
        Page{" "}
        <strong className="text-gray-800">
          {safePage}
        </strong>{" "}
        of{" "}
        <strong className="text-gray-800">
          {safeTotalPages}
        </strong>
      </span>

      <button
        type="button"
        onClick={() =>
          onChange(
            Math.min(
              safeTotalPages,
              safePage + 1
            )
          )
        }
        disabled={
          disabled ||
          safePage ===
            safeTotalPages
        }
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}