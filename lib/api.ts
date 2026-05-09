import axios, { AxiosError } from "axios";
import type { ApiError } from "./types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

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
