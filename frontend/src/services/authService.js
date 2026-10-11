import api from "./api";

export const loginUser = (data) =>
  api.post("/auth/login", data, { withCredentials: true });

export const registerUser = (data) =>
  api.post("/auth/register", data, { withCredentials: true });

export const logoutUser = () =>
  api.post("/auth/logout", null, { withCredentials: true });

export const getProfile = () =>
  api.get("/auth/profile", { withCredentials: true });