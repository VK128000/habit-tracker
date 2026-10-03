import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

import NetInfo from "@react-native-community/netinfo";
import * as SecureStore from "expo-secure-store";

export const API_BASE =
  "https://habit-tracker-w4eu.onrender.com/api";

export const api = axios.create({
  baseURL: API_BASE,

  headers: {
    "Content-Type": "application/json",
  },

  // Prevent requests from hanging forever
  timeout: 15000,
});

// -------------------------
// Token management
// -------------------------

export async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync("token");
}

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync("token", token);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync("token");
}

// -------------------------
// User management
// -------------------------

export type StoredUser = {
  id: string;
  name: string;
  email: string;
};

export async function getUser(): Promise<StoredUser | null> {
  const user = await SecureStore.getItemAsync("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export async function saveUser(
  user: StoredUser
): Promise<void> {
  await SecureStore.setItemAsync(
    "user",
    JSON.stringify(user)
  );
}

export async function removeUser(): Promise<void> {
  await SecureStore.deleteItemAsync("user");
}

// -------------------------
// Logout
// -------------------------

export async function logout(): Promise<void> {
  await removeToken();
  await removeUser();
}

// -------------------------
// Error types
// -------------------------

export type ApiErrorType =
  | "NO_INTERNET"
  | "SERVER_UNREACHABLE"
  | "SERVER_TIMEOUT"
  | "SERVER_ERROR"
  | "UNAUTHORIZED"
  | "CLIENT_ERROR"
  | "UNKNOWN";

export type ApiError = Error & {
  type?: ApiErrorType;
  status?: number;
  originalError?: unknown;
};

// -------------------------
// Error message helper
// -------------------------

export function getApiErrorMessage(
  error: unknown
): string {
  const apiError = error as ApiError;

  switch (apiError?.type) {
    case "NO_INTERNET":
      return (
        "No internet connection. Please connect to Wi-Fi " +
        "or mobile data and try again."
      );

    case "SERVER_UNREACHABLE":
      return (
        "Unable to reach the server. Please try again later."
      );

    case "SERVER_TIMEOUT":
      return (
        "The server took too long to respond. " +
        "Please try again."
      );

    case "SERVER_ERROR":
      return (
        "The server encountered an error. " +
        "Please try again later."
      );

    case "UNAUTHORIZED":
      return (
        "Your session has expired. Please log in again."
      );

    case "CLIENT_ERROR":
      return (
        apiError.message ||
        "The request could not be completed."
      );

    default:
      return (
        apiError?.message ||
        "Something went wrong. Please try again."
      );
  }
}

// -------------------------
// Axios JWT + network interceptor
// -------------------------

api.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig
  ) => {
    const networkState = await NetInfo.fetch();

    // ---------------------------------
    // No internet connection
    // ---------------------------------

    if (
      networkState.isConnected !== true ||
      networkState.isInternetReachable === false
    ) {
      const error = new Error(
        "No internet connection"
      ) as ApiError;

      error.type = "NO_INTERNET";

      return Promise.reject(error);
    }

    // ---------------------------------
    // Add JWT token
    // ---------------------------------

    const token = await getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// -------------------------
// Central response/error handling
// -------------------------

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error: AxiosError<any>) => {
    const status = error.response?.status ?? 0;

    // ---------------------------------
    // No HTTP response received
    // ---------------------------------

    if (!error.response) {
      const apiError = new Error() as ApiError;

      apiError.originalError = error;

      // ---------------------------------
      // Check actual network state
      // ---------------------------------

      const networkState = await NetInfo.fetch();

      if (
        networkState.isConnected !== true ||
        networkState.isInternetReachable === false
      ) {
        apiError.type = "NO_INTERNET";

        apiError.message =
          "No internet connection. Please connect to Wi-Fi " +
          "or mobile data and try again.";

        return Promise.reject(apiError);
      }

      // ---------------------------------
      // Request timed out
      // ---------------------------------

      if (
        error.code === "ECONNABORTED" ||
        error.code === "ETIMEDOUT"
      ) {
        apiError.type = "SERVER_TIMEOUT";

        apiError.message =
          "The server took too long to respond. " +
          "Please try again.";

        return Promise.reject(apiError);
      }

      // ---------------------------------
      // Internet exists but backend
      // cannot be reached
      // ---------------------------------

      apiError.type = "SERVER_UNREACHABLE";

      apiError.message =
        "Unable to reach the server. " +
        "Please try again later.";

      return Promise.reject(apiError);
    }

    // ---------------------------------
    // 401 Unauthorized
    // ---------------------------------

    if (status === 401) {
      const apiError = new Error(
        error.response?.data?.msg ||
          "Your session has expired. Please try again."
      ) as ApiError;

      apiError.type = "UNAUTHORIZED";
      apiError.status = status;
      apiError.originalError = error;

      return Promise.reject(apiError);
    }

    // ---------------------------------
    // Server errors: 500-599
    // ---------------------------------

    if (status >= 500) {
      const apiError = new Error(
        error.response?.data?.msg ||
          "The server encountered an error. " +
            "Please try again later."
      ) as ApiError;

      apiError.type = "SERVER_ERROR";
      apiError.status = status;
      apiError.originalError = error;

      return Promise.reject(apiError);
    }

    // ---------------------------------
    // Client errors: 400-499
    // ---------------------------------

    if (status >= 400 && status < 500) {
      const apiError = new Error(
        error.response?.data?.msg ||
          "The request could not be completed."
      ) as ApiError;

      apiError.type = "CLIENT_ERROR";
      apiError.status = status;
      apiError.originalError = error;

      return Promise.reject(apiError);
    }

    // ---------------------------------
    // Unknown error
    // ---------------------------------

    const apiError = new Error(
      error.message || "Something went wrong."
    ) as ApiError;

    apiError.type = "UNKNOWN";
    apiError.status = status;
    apiError.originalError = error;

    return Promise.reject(apiError);
  }
);