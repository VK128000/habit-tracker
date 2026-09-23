import { api, saveToken, removeToken } from "./api";

export type User = {
  id: string;
  name: string;
  email: string;
};

type AuthResponse = {
  token: string;
  user: User;
};

export async function login(email: string, pass: string) {
  const response = await api.post<AuthResponse>("/auth/login", {
    email,
    pass,
  });

  await saveToken(response.data.token);

  return response.data.user;
}

export async function signup(
  name: string,
  email: string,
  pass: string
) {
  const response = await api.post<AuthResponse>("/auth/signup", {
    name,
    email,
    pass,
  });

  await saveToken(response.data.token);

  return response.data.user;
}

export async function logout() {
  await removeToken();
}