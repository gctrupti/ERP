import { useCallback, useMemo, useState } from "react";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import type { QueryParams } from "@/types";

export interface TableState extends QueryParams {
  page: number;
  pageSize: number;
  search: string;
  sortBy?: string | undefined;
  sortDir: "asc" | "desc";
  filters: Record<string, string | undefined>;
}

export function useTableParams(initial?: Partial<TableState>) {
  const [state, setState] = useState<TableState>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    search: "",
    sortBy: initial?.sortBy,
    sortDir: initial?.sortDir ?? "asc",
    filters: initial?.filters ?? {},
  });

  const setSearch = useCallback((search: string) => {
    setState((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, page }));
  }, []);

  const setFilter = useCallback((key: string, value: string) => {
    setState((prev) => ({ ...prev, filters: { ...prev.filters, [key]: value }, page: 1 }));
  }, []);

  const toggleSort = useCallback((sortBy: string) => {
    setState((prev) => ({
      ...prev,
      sortBy,
      sortDir: prev.sortBy === sortBy && prev.sortDir === "asc" ? "desc" : "asc",
    }));
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({ ...prev, search: "", filters: {}, page: 1 }));
  }, []);

  return useMemo(
    () => ({ params: state, setSearch, setPage, setFilter, toggleSort, reset }),
    [state, setSearch, setPage, setFilter, toggleSort, reset],
  );
}
