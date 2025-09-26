"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginatorOptions {
  totalPages: number;
  currentPage: number;
  setPage: (page: number) => void;
  pageSize: number;
  navigationLimit?: number;
  maxPagesToShow?: number;
  className?: string;
}

interface PageRange {
  pages: number[];
  showStartEllipsis: boolean;
  showEndEllipsis: boolean;
}

const PaginationButton = ({
  totalPages,
  setPage,
  currentPage,
  navigationLimit = 1,
  maxPagesToShow = 5,
  className,
}: PaginatorOptions) => {
  const getPageRange = (): PageRange => {
    if (totalPages <= maxPagesToShow) {
      return {
        pages: Array.from({ length: totalPages }, (_, i) => i + 1),
        showStartEllipsis: false,
        showEndEllipsis: false,
      };
    }

    const halfRange = Math.floor(maxPagesToShow / 2);
    let startPage = Math.max(1, currentPage - halfRange);
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Adjust if we're near the end
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    const pages: number[] = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return {
      pages,
      showStartEllipsis: startPage > 2,
      showEndEllipsis: endPage < totalPages - 1,
    };
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      const newPage = Math.max(1, currentPage - navigationLimit);
      setPage(newPage);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      const newPage = Math.min(totalPages, currentPage + navigationLimit);
      setPage(newPage);
    }
  };

  const handlePageClick = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setPage(page);
    }
  };

  // Hide pagination if there is only 1 page or no pages
  if (totalPages <= 1) {
    return null;
  }

  const { pages, showStartEllipsis, showEndEllipsis } = getPageRange();

  return (
    <div className={cn("flex items-center justify-center pt-8", className)}>
      <Pagination>
        <PaginationContent className="gap-2">
          {/* Previous Button */}
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className={cn(
                "h-10 w-10 p-0 border-gray-200 hover:border-primary/30 hover:bg-primary/5 text-gray-600 hover:text-primary transition-all duration-200",
                currentPage === 1 && "opacity-50 cursor-not-allowed"
              )}
              aria-label="Go to previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </PaginationItem>

          {/* First Page */}
          {showStartEllipsis && (
            <>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageClick(1)}
                  className="h-10 w-10 p-0 border-gray-200 hover:border-primary/30 hover:bg-primary/5 text-gray-600 hover:text-primary transition-all duration-200"
                >
                  1
                </Button>
              </PaginationItem>
              <PaginationItem>
                <div className="flex h-10 w-10 items-center justify-center">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </div>
              </PaginationItem>
            </>
          )}

          {/* Page Numbers */}
          {pages.map((page) => (
            <PaginationItem key={page}>
              <Button
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageClick(page)}
                className={cn(
                  "h-10 w-10 p-0 transition-all duration-200",
                  page === currentPage
                    ? "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 border-primary text-white shadow-md"
                    : "border-gray-200 hover:border-primary/30 hover:bg-primary/5 text-gray-600 hover:text-primary"
                )}
                aria-label={`Go to page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </Button>
            </PaginationItem>
          ))}

          {/* Last Page */}
          {showEndEllipsis && (
            <>
              <PaginationItem>
                <div className="flex h-10 w-10 items-center justify-center">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </div>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageClick(totalPages)}
                  className="h-10 w-10 p-0 border-gray-200 hover:border-primary/30 hover:bg-primary/5 text-gray-600 hover:text-primary transition-all duration-200"
                >
                  {totalPages}
                </Button>
              </PaginationItem>
            </>
          )}

          {/* Next Button */}
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={cn(
                "h-10 w-10 p-0 border-gray-200 hover:border-primary/30 hover:bg-primary/5 text-gray-600 hover:text-primary transition-all duration-200",
                currentPage === totalPages && "opacity-50 cursor-not-allowed"
              )}
              aria-label="Go to next page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PaginationButton;
