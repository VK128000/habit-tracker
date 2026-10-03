import {
  api,
  saveToken,
  saveUser,
  logout as clearSession,
  StoredUser,
} from "./api";

export type User = StoredUser;

type AuthResponse = {
  token: string;
  user: User;
};

// -------------------------
// Login
// -------------------------

export async function login(
  email: string,
  pass: string
): Promise<User> {
  const response = await api.post<AuthResponse>(
    "/auth/login",
    {
      email,
      pass,
    }
  );

  const { token, user } = response.data;

  await saveToken(token);
  await saveUser(user);

  return user;
}

// -------------------------
// Signup
// -------------------------

export async function signup(
  name: string,
  email: string,
  pass: string
): Promise<User> {
  const response = await api.post<AuthResponse>(
    "/auth/signup",
    {
      name,
      email,
      pass,
    }
  );

  const { token, user } = response.data;

  await saveToken(token);
  await saveUser(user);

  return user;
}

// -------------------------
// Logout
// -------------------------

export async function logout(): Promise<void> {
  await clearSession();
}