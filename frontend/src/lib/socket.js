import { io } from "socket.io-client";

export const socket = io("https://fullstack-chat-app-master-xydu.onrender.com", {
  withCredentials: true,
});
