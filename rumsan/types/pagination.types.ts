// export type Pagination = {
//   page?: number;
//   perPage?: number;
//   sort?: string;
//   order?: 'asc' | 'desc';
// };

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

export type PaginateOptions = {
  page?: number | string;
  perPage?: number | string;
  orderByTieBreakerPropertyName?: string;
};

export type PaginateFunction = <T, K>(
  model: any,
  args?: K,
  options?: PaginateOptions,
) => Promise<PaginatedResult<T>>;

export type SearchPaginateOptions = {
  page?: number | string;
  perPage?: number | string;
  skip?: number | string;
  searchColumns?: string[];
  searchValue?: string;
};
export type SearchPaginateFunction = <T>(
  model: any,
  modelName: string,
  options?: SearchPaginateOptions,
) => Promise<PaginatedResult<T>>;

export interface Pagination<T = Record<string, unknown>> {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filter?: T;
}
// export interface PaginationState {
//   pageIndex: number;
//   pageSize: number;
//   sortBy: Array<{
//     id: string;
//     desc: boolean;
//   }>;
//   columnFilters: Array<{
//     id: string;
//     value: string;
//   }>;
// }

export type PaginationQuery = {
  pagination: Pagination;
  filters?: Record<string, unknown>;
};

export type PaginationCache<T = unknown> = {
  pageQuery: PaginationQuery;
  queryHash?: string;
  data: T[] | null;
  meta?: Record<string, any>;
};
