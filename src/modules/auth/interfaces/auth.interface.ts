export interface JwtPayload {
  sub: number; // userId
  username: string;
  role: string;
  sessionId?: number;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    username: string;
    full_name: string | null;
    role: string;
  };
  session?: {
    id: number;
    loginAt: Date;
  };
}
