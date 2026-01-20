import axios from "axios";

export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE
});

// attach token automatically to every request
api.interceptors.request.use((config) => {
  const t = localStorage.getItem("token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// keep this export so Login/Signup don't break
export function setToken(t) {
  if (t) localStorage.setItem("token", t);
  else localStorage.removeItem("token");
}
