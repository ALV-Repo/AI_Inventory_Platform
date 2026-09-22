"use client";

import type {
  HTMLAttributes,
  ReactNode,
  TableHTMLAttributes,
  ThHTMLAttributes,
  TdHTMLAttributes,
} from "react";

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  header: ReactNode;
  render?: (
    value: unknown,
    row: T,
    index: number
  ) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface TableProps
  extends Omit<
    TableHTMLAttributes<HTMLTableElement>,
    "children"
  > {
  columns?: TableColumn[];
  data?: Record<string, unknown>[];
  rows?: Record<string, unknown>[];
  children?: ReactNode;
  emptyMessage?: ReactNode;
  loading?: boolean;
  loadingMessage?: ReactNode;
  className?: string;
}

export function Table({
  columns,
  data,
  rows,
  children,
  emptyMessage = "No data available.",
  loading = false,
  loadingMessage = "Loading...",
  className = "",
  ...props
}: TableProps) {
  const tableRows = data ?? rows ?? [];

  /*
   * If children are provided, render the table as a
   * normal HTML table. This keeps the component compatible
   * with existing pages that already use <Table> manually.
   */
  if (children) {
    return (
      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table
          className={`w-full min-w-full border-collapse text-left text-sm ${className}`}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table
        className={`w-full min-w-full border-collapse text-left text-sm ${className}`}
        {...props}
      >
        {columns && columns.length > 0 && (
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`whitespace-nowrap border-b border-gray-200 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500 ${
                    column.headerClassName ?? ""
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
        )}

        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr>
              <td
                colSpan={
                  columns?.length || 1
                }
                className="px-4 py-8 text-center text-xs text-gray-500"
              >
                {loadingMessage}
              </td>
            </tr>
          ) : tableRows.length === 0 ? (
            <tr>
              <td
                colSpan={
                  columns?.length || 1
                }
                className="px-4 py-8 text-center text-xs text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : columns && columns.length > 0 ? (
            tableRows.map((row, rowIndex) => (
              <tr
                key={
                  String(
                    row.id ??
                      row._id ??
                      row.key ??
                      rowIndex
                  )
                }
                className="transition-colors hover:bg-gray-50"
              >
                {columns.map((column) => {
                  const value =
                    row[column.key];

                  return (
                    <td
                      key={column.key}
                      className={`whitespace-nowrap px-4 py-3 text-xs text-gray-700 ${
                        column.className ?? ""
                      }`}
                    >
                      {column.render
                        ? column.render(
                            value,
                            row,
                            rowIndex
                          )
                        : formatCellValue(
                            value
                          )}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td
                className="px-4 py-8 text-center text-xs text-gray-500"
                colSpan={1}
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function formatCellValue(
  value: unknown
): ReactNode {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/* ------------------------------------------------------------------
 * Optional sub-components
 * ---------------------------------------------------------------- */

export interface TableHeaderProps
  extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export function TableHeader({
  children,
  className = "",
  ...props
}: TableHeaderProps) {
  return (
    <thead
      className={`bg-gray-50 ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
}

export interface TableBodyProps
  extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export function TableBody({
  children,
  className = "",
  ...props
}: TableBodyProps) {
  return (
    <tbody
      className={`divide-y divide-gray-100 ${className}`}
      {...props}
    >
      {children}
    </tbody>
  );
}

export interface TableRowProps
  extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
}

export function TableRow({
  children,
  className = "",
  ...props
}: TableRowProps) {
  return (
    <tr
      className={`transition-colors hover:bg-gray-50 ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export interface TableHeadProps
  extends ThHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
}

export function TableHead({
  children,
  className = "",
  ...props
}: TableHeadProps) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap border-b border-gray-200 px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export interface TableCellProps
  extends TdHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
}

export function TableCell({
  children,
  className = "",
  ...props
}: TableCellProps) {
  return (
    <td
      className={`whitespace-nowrap px-4 py-3 text-xs text-gray-700 ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}

export interface TableCaptionProps
  extends HTMLAttributes<HTMLTableCaptionElement> {
  children?: ReactNode;
}

export function TableCaption({
  children,
  className = "",
  ...props
}: TableCaptionProps) {
  return (
    <caption
      className={`px-4 py-3 text-left text-xs text-gray-500 ${className}`}
      {...props}
    >
      {children}
    </caption>
  );
}

export default Table;