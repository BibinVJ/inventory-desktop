import { User } from "./User";

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  fetchProfile: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

export interface LoginResponse {
  data: {
    user: User;
    token: {
      access_token: string;
    };
  };
}
