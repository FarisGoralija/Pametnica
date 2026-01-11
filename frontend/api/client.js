import axios from "axios";

// Use env var if provided (expo: EXPO_PUBLIC_API_BASE), otherwise fallback.
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE?.trim() || "http://localhost:5125";

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

const client = axios.create({
  baseURL: API_BASE_URL,
});

client.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export default client;
