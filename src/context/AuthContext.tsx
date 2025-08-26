import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import * as AuthService from "../services/AuthService";
import { AuthContextType, User } from "../types";
import * as ProfileService from "../services/ProfileService";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await ProfileService.getProfile();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setUser(null);
      setIsAuthenticated(false);
      await AuthService.logout(); // Clear any lingering tokens
    }
  }, []);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AuthService.getToken();
      if (token) {
        await fetchProfile();
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to check auth status:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (identifier: string, password: string) => {
    const response = await AuthService.login(identifier, password);
    if (response.data.token.access_token) {
      await AuthService.storeToken(response.data.token.access_token);
      await fetchProfile();
    }
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const hasPermission = (permission: string) => {
    const result = user?.permission_names?.includes(permission) || false;
    return result;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        loading,
        fetchProfile,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
