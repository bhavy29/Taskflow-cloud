import api from "./api";

export const getDashboardStats = () => api.get("/dashboard/stats").then((response) => response.data);

export const getDashboardTasks = () => api.get("/dashboard/tasks").then((response) => response.data);

export const getDashboardProjects = () => api.get("/dashboard/projects").then((response) => response.data);