export interface ApiResponse<T = unknown> {
  status: "success" | "fail" | "error";
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  status: "fail" | "error";
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}
