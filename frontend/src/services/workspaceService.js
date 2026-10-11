import api from "./api";

export const createWorkspace = async (data) => {
    const response = await api.post("/workspaces", data, { withCredentials: true });
    return response.data;
};

export const getWorkspaces = async () => {
    const response = await api.get("/workspaces", { withCredentials: true });
    return response.data;
};

export const getWorkspaceById = async (id) => {
    const response = await api.get(`/workspaces/${id}`, { withCredentials: true });
    return response.data;
};

export const getWorkspaceMembers = async (id) => {
    const response = await api.get(`/workspaces/${id}/members`, { withCredentials: true });
    return response.data;
};

export const addWorkspaceMember = async (id, data) => {
    const response = await api.post(`/workspaces/${id}/members`, data, { withCredentials: true });
    return response.data;
};

export const getWorkspaceTasks = async (id) => {
    const response = await api.get(`/workspaces/${id}/tasks`, { withCredentials: true });
    return response.data;
};

export const createWorkspaceTask = async (id, data) => {
    const response = await api.post(`/workspaces/${id}/tasks`, data, { withCredentials: true });
    return response.data;
};
