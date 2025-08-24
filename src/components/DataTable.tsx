"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnFiltersState,
  OnChangeFn,
  SortingState,
} from "@tanstack/react-table";
import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  customFilters?: ReactNode;
  exportFileName?: string;
  exportSheetName?: string;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  showExport?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  customFilters,
  exportFileName = "data",
  exportSheetName = "Données",
  columnFilters: externalColumnFilters = [],
  onColumnFiltersChange,
  showExport = true,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [internalColumnFilters, setInternalColumnFilters] = useState<ColumnFiltersState>([]);

  // Utiliser les filtres externes si fournis, sinon les filtres internes
  const columnFilters = externalColumnFilters.length > 0 ? externalColumnFilters : internalColumnFilters;
  const setColumnFilters = onColumnFiltersChange || setInternalColumnFilters;

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnFilters },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10, // Afficher seulement 5 éléments par page pour que la pagination soit visible
      },
    },
  });

  const filteredRows = table.getFilteredRowModel().rows.map((row) => row.original);

  /** 🔽 Export CSV */
  const handleExportCSV = () => {
    const csv = Papa.unparse(filteredRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${exportFileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /** 🔽 Export Excel */
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, exportSheetName);
    XLSX.writeFile(workbook, `${exportFileName}.xlsx`);
  };

  /** 🔽 Export PDF */
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Liste des ${exportSheetName}`, 14, 16);
    
    // Filtrer les colonnes pour exclure "Actions"
    const exportColumns = columns.filter(col => col.id !== "actions");
    
    const headers = exportColumns.map((col) => {
      const header = col.header;
      return typeof header === 'string' ? header : col.id || 'Colonne';
    });

    const bodyData = filteredRows.map((row: TData) => {
      const rowData: string[] = [];
      exportColumns.forEach((col) => {
        let value = '';
        try {
          if ('accessorKey' in col && col.accessorKey) {
            const accessorKey = col.accessorKey as keyof TData;
            value = String(row[accessorKey] || '');
          } else if ('accessorFn' in col && col.accessorFn) {
            const accessorFn = col.accessorFn as (row: TData) => unknown;
            value = String(accessorFn(row) || '');
          } else if (col.id && (row as Record<string, unknown>)[col.id]) {
            value = String((row as Record<string, unknown>)[col.id] || '');
          } else {
            value = '';
          }
        } catch {
          value = '';
        }
        rowData.push(value);
      });
      return rowData;
    });

    autoTable(doc, {
      startY: 22,
      head: [headers],
      body: bodyData,
    });

    doc.save(`${exportFileName}.pdf`);
  };

  return (
      <div className="space-y-3 p-0 md:p-2 overflow-x-auto">
      {/* 🔍 Recherche + Filtres + Export */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white rounded-lg p-3 shadow-sm">
        {/* Recherche */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full md:w-64 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex gap-2">
          {/* Filtres personnalisés */}
          {customFilters}

          {/* 🚀 Menu Export - Conditionné par showExport */}
          {showExport && (
            <div className="relative group">
              <button className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-3 py-2 text-sm hover:bg-blue-700 transition-all">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exporter</span>
              </button>
              <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg hidden group-hover:block z-10 min-w-[150px]">
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  onClick={handleExportCSV}
                >
                  CSV
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  onClick={handleExportExcel}
                >
                  Excel
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  onClick={handleExportPDF}
                >
                  PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-black">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-gray-800 transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <span className="text-gray-400">
                          {header.column.getIsSorted() === "asc" ? "↑" : ""}
                          {header.column.getIsSorted() === "desc" ? "↓" : ""}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors duration-150">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2 text-sm text-gray-900">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-sm text-gray-500">Aucune donnée trouvée</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
        <span className="text-sm text-gray-600">
          {table.getFilteredRowModel().rows.length > 0 ? (
            <>
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} -{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{" "}
              sur {table.getFilteredRowModel().rows.length}
            </>
          ) : (
            "0 sur 0"
          )}
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-2 py-1 text-xs"
          >
            «
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-2 py-1 text-xs"
          >
            ‹
          </Button>
          <span className="flex items-center px-2 text-xs">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-2 py-1 text-xs"
          >
            ›
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-2 py-1 text-xs"
          >
            »
          </Button>
        </div>
      </div>
    </div>
  );
}
