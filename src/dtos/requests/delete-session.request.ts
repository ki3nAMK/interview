export interface DeleteSessionRequest {
  userId: string;
  sessionId: string;
  accessToken?: string;
  refreshToken?: string;
}
