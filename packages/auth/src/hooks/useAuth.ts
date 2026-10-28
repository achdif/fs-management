import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { getApiClient } from '../services/api.client';
import { ErrorCodes } from '../utils/errorCodes';
import type { AuthStorageService } from '../storage/factory';
import type { LoginCredentials, RegisterCredentials, User } from '../types/auth';

interface UseAuthOptions {
  storage: AuthStorageService;
}

export function useAuth({ storage }: UseAuthOptions) {
  const { user, isAuthenticated, isLoading, error, errorCode, isNetworkError, setUser, setLoading, setError, logout } = useAuthStore();

  const isNetworkFailure = (err: unknown): boolean => {
    const message = err instanceof Error ? err.message : '';
    return message.includes('network') ||
           message.includes('connection') ||
           message.includes('ENOTFOUND') ||
           message.includes('ECONNREFUSED') ||
           message.includes('ETIMEDOUT') ||
           message.includes('fetch') ||
           message.includes('Network request failed') ||
           (err instanceof Error && err.name === 'NetworkError');
  };

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const api = getApiClient();
      const res = await api.signin(credentials);

      if (!res.success || !res.tokens) {
        setError('Invalid email or password', ErrorCodes.AUTH_INVALID_CREDENTIALS);
        return false;
      }

      // Store tokens
      await storage.setTokens(res.tokens.accessToken, res.tokens.refreshToken, res.tokens.expiresAt);
      api.setToken(res.tokens.accessToken);

      // Set user profile
      if (res.user) {
        setUser(res.user as User);
      }

      return true;
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Login failed';
      const isNet = isNetworkFailure(err);
      const code = err.code || (isNet ? ErrorCodes.DEVICE_NETWORK_OFFLINE : ErrorCodes.DATABASE_CONNECTION_FAILED);
      setError(message, code, isNet);
      return false;
    } finally {
      setLoading(false);
    }
  }, [storage, setLoading, setError, setUser]);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const api = getApiClient();
      const res = await api.signup({
        email: credentials.email,
        password: credentials.password,
        fullName: credentials.fullName,
        phone: credentials.phone,
      });

      return { success: res.success, email: credentials.email };
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      const isNet = isNetworkFailure(err);
      const code = err.code || (isNet ? ErrorCodes.DEVICE_NETWORK_OFFLINE : ErrorCodes.DATABASE_QUERY_FAILED);
      setError(message, code, isNet);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const verifyOTP = useCallback(async (email: string, otp: string) => {
    setLoading(true);
    setError(null);

    try {
      const api = getApiClient();
      const res = await api.verifyOtp({ email, otp });
      return res.success;
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'OTP verification failed';
      const isNet = isNetworkFailure(err);
      const code = err.code || (isNet ? ErrorCodes.DEVICE_NETWORK_OFFLINE : ErrorCodes.AUTH_OTP_INVALID);
      setError(message, code, isNet);
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const forgotPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const api = getApiClient();
      const res = await api.forgotPassword(email);
      return res.success;
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Failed to send reset link';
      const isNet = isNetworkFailure(err);
      const code = err.code || (isNet ? ErrorCodes.DEVICE_NETWORK_OFFLINE : ErrorCodes.GMAIL_SEND_FAILED);
      setError(message, code, isNet);
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    setLoading(true);
    setError(null);

    try {
      const api = getApiClient();
      const res = await api.resetPassword(token, newPassword);
      return res.success;
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      const isNet = isNetworkFailure(err);
      const code = err.code || (isNet ? ErrorCodes.DEVICE_NETWORK_OFFLINE : ErrorCodes.AUTH_RESET_TOKEN_INVALID);
      setError(message, code, isNet);
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    setError(null);

    try {
      const api = getApiClient();
      const res = await api.changePassword(currentPassword, newPassword);
      return res.success;
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Password change failed';
      const isNet = isNetworkFailure(err);
      const code = err.code || (isNet ? ErrorCodes.DEVICE_NETWORK_OFFLINE : ErrorCodes.AUTH_INVALID_CREDENTIALS);
      setError(message, code, isNet);
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const logoutUser = useCallback(async () => {
    setLoading(true);

    try {
      const api = getApiClient();
      await api.signout().catch(() => {});
      api.setToken(null);

      // Clear tokens from storage
      await storage.clearTokens();

      // Clear store
      logout();

      return true;
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      const isNet = isNetworkFailure(err);
      const code = isNet ? ErrorCodes.DEVICE_NETWORK_OFFLINE : ErrorCodes.DATABASE_CONNECTION_FAILED;
      setError(message, code, isNet);
      return false;
    } finally {
      setLoading(false);
    }
  }, [storage, setLoading, setError, logout]);

  const checkAuth = useCallback(async () => {
    setLoading(true);

    try {
      const isExpired = await storage.isTokenExpired();
      if (isExpired) {
        logout();
        return false;
      }

      const accessToken = await storage.getAccessToken();
      if (!accessToken) {
        logout();
        return false;
      }

      const api = getApiClient();
      api.setToken(accessToken);

      const res = await api.getMe();
      if (res?.user) {
        setUser(res.user as User);
        return true;
      }

      logout();
      return false;
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Authentication check failed';
      const isNet = isNetworkFailure(err);
      const code = message.includes('expired') || message.includes('token')
        ? ErrorCodes.AUTH_TOKEN_EXPIRED
        : isNet
        ? ErrorCodes.DEVICE_NETWORK_OFFLINE
        : ErrorCodes.DATABASE_CONNECTION_FAILED;
      setError(message, code, isNet);
      logout();
      return false;
    } finally {
      setLoading(false);
    }
  }, [storage, setLoading, logout, setUser, setError]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    errorCode,
    isNetworkError,
    login,
    register,
    verifyOTP,
    forgotPassword,
    resetPassword,
    changePassword,
    logout: logoutUser,
    checkAuth,
  };
}
