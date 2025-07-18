"use client";

import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";

interface PaginationParams {
  limit: number;
  page: number;
  totalRows: number;
  totalPages: number;
}

interface UseGetPaginationQueryParams<T, R> {
  limit?: number;
  fetchFun: (params: {
    page: number;
    limit: number;
    searchQuery?: string;
  }) => Promise<R>;
  parseResponse: (response: R) => {
    results: T[];
    limit: number;
    page: number;
    totalPages: number;
    totalResults: number;
  };
  key?: string;
}
interface RefetchParams {
  page?: number;
  limit?: number;
}
export const usePaginationQuery = <T, R>({
  limit = 10,
  fetchFun,
  parseResponse,
  key,
}: UseGetPaginationQueryParams<T, R>) => {
  const [paginationParams, setPaginationParams] = useState<PaginationParams>({
    limit,
    page: 1,
    totalRows: 0,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [customFilters, setCustomFilters] = useState<
    Record<string, unknown> | undefined
  >(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<T[]>([]);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const debouncedSetSearchQuery = useCallback(
    debounce((query: string | undefined) => {
      setSearchQuery(query);
      setPaginationParams((prev) => ({ ...prev, page: 1 }));
    }, 500),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    setData([]);
    setPaginationParams({
      limit,
      page: 1,
      totalRows: 0,
      totalPages: 0,
    });
  }, [key, limit]);

  useEffect(() => {
    setLoading(true);
    fetchFun({
      page: paginationParams.page,
      limit: paginationParams.limit,
      searchQuery,
      ...(customFilters ?? {}),
    })
      .then((response) => {
        const { results, limit, page, totalPages, totalResults } =
          parseResponse(response);
        setData(results);
        setPaginationParams({
          limit,
          totalPages,
          totalRows: totalResults,
          page,
        });
      })
      .catch((error: Error) => {
        setError(error?.message ?? "An error occurred");
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, paginationParams.page, customFilters, key, refetchTrigger]);

  const updateData = useCallback(
    ({ data, pageParams }: { data?: T[]; pageParams?: PaginationParams }) => {
      if (data) {
        setData(data);
      }
      if (pageParams) {
        setPaginationParams(pageParams);
      }
    },
    []
  );

  const refetch = (refetchParams: RefetchParams = {}) => {
    setPaginationParams((prev) => ({
      ...prev,
      page: refetchParams.page ?? prev.page,
      limit: refetchParams.limit ?? prev.limit,
    }));
    setRefetchTrigger((prev) => prev + 1);
  };

  return {
    error,
    data,
    loading,
    updateData,
    pageParams: {
      currentPage: paginationParams.page,
      pageSize: paginationParams.limit,
      totalRows: paginationParams.totalRows,
      setPage: (page: number) => {
        const maxPages = paginationParams.totalPages;
        const newPage = Math.min(Math.max(page, 1), maxPages);
        setPaginationParams((prev) => ({ ...prev, page: newPage }));
      },
      totalPages: paginationParams.totalPages,
    },
    filters: {
      searchQuery,
      customFilters,
      setCustomFilters,
      setSearchQuery: debouncedSetSearchQuery,
    },
    refetch,
  };
};
