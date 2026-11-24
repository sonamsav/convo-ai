export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ComponentVariant = 
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info'
  | 'neutral';

export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
}

export interface SortParams<T = string> {
  field: T;
  order: 'asc' | 'desc';
}

export interface ApiState<T = unknown> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}
