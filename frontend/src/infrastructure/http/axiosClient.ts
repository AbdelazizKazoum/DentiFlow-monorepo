// infrastructure/http/axiosClient.ts

import axios from "axios";

export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // important if using refresh token cookies
});
