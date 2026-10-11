import { io } from "socket.io-client";

let socketInstance = null;

export const connectSocket = () => {
    if (socketInstance) return socketInstance;

    socketInstance = io("/", {
        withCredentials: true,
        transports: ["websocket", "polling"],
    });

    return socketInstance;
};

export const getSocket = () => {
    return connectSocket();
};

export const disconnectSocket = () => {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
};