/**
 * Utility functions for pagination and page-related operations
 */

/**
 * Interface for pagination data
 */
export interface PaginationData<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginates an array of items
 * @param items Array of items to paginate
 * @param page Current page number (1-based)
 * @param pageSize Number of items per page
 * @returns Pagination data object
 */
export function paginate<T>(
  items: T[], 
  page: number = 1, 
  pageSize: number = 10
): PaginationData<T> {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  
  return {
    items: items.slice(startIndex, endIndex),
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  };
}

/**
 * Generates an array of page numbers for pagination controls
 * @param currentPage Current active page
 * @param totalPages Total number of pages
 * @param maxVisiblePages Maximum number of page buttons to show (default: 5)
 * @returns Array of page numbers with possible ellipsis
 */
export function generatePageNumbers(
  currentPage: number, 
  totalPages: number, 
  maxVisiblePages: number = 5
): (number | '...')[] {
  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(maxVisiblePages / 2);
  let startPage = Math.max(1, currentPage - half);
  let endPage = startPage + maxVisiblePages - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages: (number | '...')[] = [];
  
  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) {
      pages.push('...');
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push('...');
    }
    pages.push(totalPages);
  }

  return pages;
}

/**
 * Calculates the offset for pagination queries
 * @param page Page number (1-based)
 * @param pageSize Number of items per page
 * @returns The offset to use in database queries
 */
export function getPaginationOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

/**
 * Validates and sanitizes pagination parameters
 * @param page Requested page number
 * @param pageSize Requested page size
 * @param maxPageSize Maximum allowed page size
 * @returns Sanitized page and pageSize
 */
export function validatePagination(
  page: number = 1,
  pageSize: number = 10,
  maxPageSize: number = 100
): { page: number; pageSize: number } {
  const validatedPage = Math.max(1, Math.floor(page) || 1);
  const validatedPageSize = Math.min(
    Math.max(1, Math.floor(pageSize) || 10),
    maxPageSize
  );
  
  return {
    page: validatedPage,
    pageSize: validatedPageSize
  };
}
