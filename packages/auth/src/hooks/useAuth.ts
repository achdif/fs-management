import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { getApiClient } from '../services/api.client';
import NativeNetworkMonitor from '@fs-management/shared/src/native/NativeNetworkMonitor';
import { ErrorCodes } from '../utils/errorCodes';
import type { AuthStorageService } from '@fs-management/shared';
import type { LoginCredentials, RegisterCredentials, User } from '../types/auth';

interface UseAuthOptions {
  /** Wajib untuk bearer mode (mobile). Diabaikan saat cookieAuth=true. */
  storage?: AuthStorageService;
  /**
   * true = web: token disimpan backend sebagai HttpOnly cookie,
   * JS tidak pernah menyimpan/mengirim token manual.
   */
  cookieAuth?: boolean;
}

export function useAuth({ storage, cookieAuth = false }: UseAuthOptions) {
  const { user, isAuthenticated, isLoading, error, errorCode, errorSource, isNetworkError, setUser, setLoading, setError, setRetryAction, logout } = useAuthStore();

  const isNetworkFailure = async (err: unknown): Promise<boolean> => {
    // Server merespons dengan HTTP error (punya status) = bukan network error,
    // walaupun pesannya mengandung kata "connection"/"fetch" (mis. DB connection failed).
    if (err && typeof err === 'object' && typeof (err as any).status === 'number') {
      return false;
    }
    const message = err instanceof Error ? err.message : '';
    const looksLikeNetwork = message.includes('network') ||
           message.includes('ENOTFOUND') ||
           message.includes('ECONNREFUSED') ||
           message.includes('ETIMEDOUT') ||
           message.includes('fetch failed') ||
           message.includes('Network request failed') ||
           (err instanceof Error && err.name === 'NetworkError');
    if (!looksLikeNetwork) {
      return false;
    }
    // Fetch gagal: bedakan device offline vs backend/server down.
    // Device masih online berarti masalahnya di server → bukan network error.
    try {
      const status = await NativeNetworkMonitor.getCurrentStatus();
      return !status.isConnected;
    } catch {
      return true;
    }
  };

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const api = getApiClient();
      const res = await api.signin(credentials);

      if (!res.success || (!cookieAuth && !res.tokens)) {
        setError('Invalid email or password', ErrorCodes.AUTH_INVALID_CREDENTIALS, false, 'login');
        setRetryAction(() => () => { void login(credentials); });
        return false;
      }

      if (!cookieAuth && res.tokens) {
        // Bearer mode (mobile): simpan token & kirim via Authorization header.
        await storage!.setTokens(res.tokens.accessToken, res.tokens.refreshToken, res.tokens.expiresAt);
        api.setToken(res.tokens.accessToken);
      }
      // Cookie mode (web): backend sudah set HttpOnly cookie via Set-Cookie.

      // Set user profile
      if (res.user) {
        setUser(res.user as User);
      }

      return true;
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Login failed';
      const isNet = await isNetworkFailure(err);
      const code = err.code || (isNet ? ErrorCodes.DEVICE_NETWORK_OFFLINE : ErrorCodes.DATABASE_CONNECTION_FAILED);
      setError(message, code, isNet, 'login');
      setRetryAction(() => () => { void login(credentials); });
      return false;
    } finally {
      setLoading(false);
    }
  }, [storage, setLoading, setError, setRetryAction, setUser]);

  const register = useCallback(async (credentials: RegisterCredentials): Promise<{ success: boolean; email?: string }> => {
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
      const isNet = await isNetworkFailure(err);
      const code = err.code || (isNet ? ErrorCodes.DEVICE_NETWORK_OFFLINE : ErrorCodes.DATABASE_QUERY_FAILED);
      setError(message, code, isNet, 'register');
      setRetryAction(() => () => { void register(credentials); });
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setRetryAction]);

  const verifyOTP = useCallback(async (email: string, otp: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const api = getApiClient();
      const res = await api.verifyOtp({ email, otp });
      return res.success;
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'OTP verification failed';
      const isNet = await isNetworkFailure(err);
      const code = err.code || (isNet ? ErrorCodes.DEVICE_NETWORK_OFFLINE : ErrorCodes.AUTH_OTP_INVALID);
      setError(message, code, isNet, 'otp');
      setRetryAction(() => () => { void verifyOTP(email, otp); });
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setRetryAction]);

  const forgotPassword = useCallback(async (email: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const api = getApiClient();
      const res = await api.forgotPassword(email);
      return res.success;
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Failed to send reset link';
      const isNet = await isNetworkFailure(err);
      const code = err.code || (isNet ? ErrorCodes.DEVICE_NETWORK_OFFLINE : ErrorCodes.GMAIL_SEND_FAILED);
      setError(message, code, isNet, 'forgot');
      setRetryAction(() => () => { void forgotPassword(email); });
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setRetryAction]);

  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const api = getApiClient();
      const res = await api.resetPassword(token, newPassword);
      return res.success;
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      const isNet = await isNetworkFailure(err);
      const code = err.code || (isNet ? ErrorCodes.DEVICE_NETWORK_OFFLINE : ErrorCodes.AUTH_RESET_TOKEN_INVALID);
      setError(message, code, isNet, 'reset');
      setRetryAction(() => () => { void resetPassword(token, newPassword); });
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setRetryAction]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const api = getApiClient();
      const res = await api.changePassword(currentPassword, newPassword);
      return res.success;
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Password change failed';
      const isNet = await isNetworkFailure(err);
      const code = err.code || (isNet ? ErrorCodes.DEVICE_NETWORK_OFFLINE : ErrorCodes.AUTH_INVALID_CREDENTIALS);
      setError(message, code, isNet, 'changePassword');
      setRetryAction(() => () => { void changePassword(currentPassword, newPassword); });
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setRetryAction]);

  const logoutUser = useCallback(async (): Promise<boolean> => {
    setLoading(true);

    try {
      const api = getApiClient();
      await api.signout().catch(() => {});
      api.setToken(null);

      // Bearer mode: clear tokens dari storage. Cookie mode: backend clear cookie.
      if (!cookieAuth) {
        await storage!.clearTokens();
      }

      // Clear store
      logout();

      return true;
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      const isNet = await isNetworkFailure(err);
      const code = isNet ? ErrorCodes.DEVICE_NETWORK_OFFLINE : ErrorCodes.DATABASE_CONNECTION_FAILED;
      setError(message, code, isNet, 'logout');
      setRetryAction(() => () => { void logoutUser(); });
      return false;
    } finally {
      setLoading(false);
    }
  }, [storage, cookieAuth, setLoading, setError, setRetryAction, logout]);

  const checkAuth = useCallback(async () => {
    setLoading(true);

    try {
      const api = getApiClient();

      if (cookieAuth) {
        // Web: cookie terkirim otomatis; 401 → belum login.
        const res = await api.getMe();
        if (res?.user) {
          setUser(res.user as User);
          return true;
        }
        logout();
        return false;
      }

      const isExpired = await storage!.isTokenExpired();
      if (isExpired) {
        logout();
        return false;
      }

      const accessToken = await storage!.getAccessToken();
      if (!accessToken) {
        logout();
        return false;
      }

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
      const isNet = await isNetworkFailure(err);
      const code = message.includes('expired') || message.includes('token')
        ? ErrorCodes.AUTH_TOKEN_EXPIRED
        : isNet
        ? ErrorCodes.DEVICE_NETWORK_OFFLINE
        : ErrorCodes.DATABASE_CONNECTION_FAILED;
      setError(message, code, isNet, 'checkAuth');
      logout();
      return false;
    } finally {
      setLoading(false);
    }
  }, [storage, cookieAuth, setLoading, logout, setUser, setError]);

  const clearError = useCallback(() => {
    setError(null);
    setRetryAction(null);
  }, [setError, setRetryAction]);

  const retryLastAction = useCallback(() => {
    const action = useAuthStore.getState().retryAction;
    if (action) {
      action();
    }
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    errorCode,
    errorSource,
    isNetworkError,
    clearError,
    retryLastAction,
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
