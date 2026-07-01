import api from "./api";

export const updateTask = async (taskId, status) => {
    return api.put(
        `/tasks/${taskId}`,
        { status },
        { withCredentials: true }
    );
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