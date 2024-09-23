export type RouteHandlerResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type ServerActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface RepurposeRequestBody {
  url: string;
  instructions: string;
  formatTemplate: string;
  engagementQuestion: string;
  CTA: string;
  contentStyle: string;
}
