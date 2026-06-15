import axios, { AxiosError } from "axios";
import type { ApiError } from "./types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let authRedirectInProgress = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error instanceof AxiosError &&
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !authRedirectInProgress &&
      (window.location.pathname.startsWith("/dashboard") ||
        window.location.pathname.startsWith("/admin"))
    ) {
      authRedirectInProgress = true;
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.replace(`/login?next=${next}`);
    }
    return Promise.reject(error);
  }
);

// Unwrap Axios errors into a plain message string so UI code stays simple.
export const getErrorMessage = (err: unknown): string => {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiError | undefined;
    if (data?.message) return data.message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
};

export default api;
