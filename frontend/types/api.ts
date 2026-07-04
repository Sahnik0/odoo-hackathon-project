// Mirrors the backend envelope (INSTRUCTIONS.md Section 7) — every response is
// one of these two shapes.
export interface ApiMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: ApiMeta;
  unreadCount?: number;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}
