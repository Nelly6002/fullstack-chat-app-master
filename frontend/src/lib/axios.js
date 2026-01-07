import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:"https://fullstack-chat-app-master-xydu.onrender.com",
  withCredentials: true,
});
