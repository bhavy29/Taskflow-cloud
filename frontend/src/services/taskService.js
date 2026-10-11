import api from "./api";

export const getMyTasks = () =>
    api.get("/tasks", { withCredentials: true }).then((response) => response.data);

export const updateTask = async (taskId, payload) => {
    const response = await api.put(
        `/tasks/${taskId}`,
        payload,
        { withCredentials: true }
    );

    return response.data;
};

export const updateTaskStatus = async (taskId, status) => {
    const response = await api.patch(
        `/tasks/${taskId}/status`,
        { status },
        {
            withCredentials: true
        }
    );  

    return response.data;
};

export const createTask = async (taskData) => {
    const response = await api.post(
        `/tasks`,
        taskData,
        {
            withCredentials: true
        }
    );

    return response.data;
};

export const deleteTask = async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`, { withCredentials: true });
    return response.data;
};