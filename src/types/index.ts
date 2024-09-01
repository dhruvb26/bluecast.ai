export type RouteHandlerResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
