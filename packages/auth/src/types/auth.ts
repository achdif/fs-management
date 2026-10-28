export interface User {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  errorCode: string | null;
  isNetworkError: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}
