import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: "start" | "end";
  className?: string;
}

/** Generic typed table styled like the demo's data tables (RTL-safe). */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Rendered instead of the table body when there are no rows. */
  empty?: ReactNode;
}) {
  if (rows.length === 0 && empty) {
    return <>{empty}</>;
  }
  return (
    <table className="w-full border-collapse text-[13px]">
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className={cn(
                "whitespace-nowrap border-b-[1.5px] border-line px-2.5 py-2 text-[11.5px] font-bold text-muted",
                col.align === "end" ? "text-end" : "text-start",
                col.className
              )}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={rowKey(row)}
            className="border-b border-line last:border-b-0 hover:bg-[#fafbfd]"
          >
            {columns.map((col) => (
              <td
                key={col.key}
                className={cn(
                  "px-2.5 py-2.5 align-middle",
                  col.align === "end" ? "text-end" : "text-start",
                  col.className
                )}
              >
                {col.cell(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
