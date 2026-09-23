import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const API_BASE =
  "https://habit-tracker-w4eu.onrender.com/api";

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
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

export async function saveUser(user: StoredUser): Promise<void> {
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
// Axios JWT interceptor
// -------------------------

api.interceptors.request.use(async (config) => {
  const token = await getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});