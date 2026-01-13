import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = "https://fullstack-chat-app-master-xydu.onrender.com";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  searchUsers: async (query) => {
    try {
      const res = await axiosInstance.get(`/auth/search?query=${query}`);
      return res.data;
    } catch (error) {
      toast.error(error.response.data.message);
      return [];
    }
  },

  sendFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/auth/friend-request/${userId}`);
      toast.success("Friend request sent");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  acceptFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/auth/accept-friend/${userId}`);
      toast.success("Friend request accepted");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  declineFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/auth/decline-friend/${userId}`);
      toast.success("Friend request declined");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  getFriendRequests: async () => {
    try {
      const res = await axiosInstance.get("/auth/friend-requests");
      return res.data;
    } catch (error) {
      toast.error(error.response.data.message);
      return [];
    }
  },

  getFriends: async () => {
    try {
      const res = await axiosInstance.get("/auth/friends");
      return res.data;
    } catch (error) {
      toast.error(error.response.data.message);
      return [];
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    socket.on("friendRequest", (data) => {
      toast.success("You have a new friend request!");
    });

    socket.on("newMessage", (message) => {
      toast.success(`New message from ${message.senderId}`);
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
