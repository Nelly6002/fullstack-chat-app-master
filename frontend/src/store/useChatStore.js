import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  groups: [],
  selectedUser: null,
  selectedGroup: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  editedMessage: null,
  replyTo: null,
  typingUsers: new Set(),
  searchQuery: "",
  searchResults: [],

  setEditedMessage: (message) => set({ editedMessage: message }),
  clearEditedMessage: () => set({ editedMessage: null }),
  setReplyTo: (message) => set({ replyTo: message }),
  clearReplyTo: () => set({ replyTo: null }),
  setTyping: (userId, isTyping) => set((state) => {
    const newTyping = new Set(state.typingUsers);
    if (isTyping) newTyping.add(userId);
    else newTyping.delete(userId);
    return { typingUsers: newTyping };
  }),

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getGroups: async () => {
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  getMessages: async (chatId, type = 'user') => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${chatId}?type=${type}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, selectedGroup, messages, replyTo } = get();
    const chatId = selectedUser ? selectedUser._id : selectedGroup._id;
    const type = selectedUser ? 'user' : 'group';
    try {
      const res = await axiosInstance.post(`/messages/send/${chatId}`, { ...messageData, replyTo: replyTo?._id, type, chatId });
      set({ messages: [...messages, res.data], replyTo: null });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, selectedGroup } = get();
    if (!selectedUser && !selectedGroup) return;

    const socket = useAuthStore.getState().socket;
    const chatId = selectedUser ? selectedUser._id : selectedGroup._id;

    socket.on("newMessage", (newMessage) => {
      const isRelevant = selectedUser
        ? newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id
        : newMessage.groupId === selectedGroup._id;
      if (!isRelevant) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });

    socket.on("messageEdited", (updatedMessage) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        ),
      }));
    });

    socket.on("messageDeleted", (messageId) => {
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
    });

    socket.on("typing", (data) => {
      if (data.from !== chatId) return;
      get().setTyping(data.from, data.isTyping);
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageEdited");
    socket.off("messageDeleted");
    socket.off("typing");
  },

  editMessage: async (messageId, newText) => {
    try {
      const res = await axiosInstance.put(`/messages/edit/${messageId}`, { text: newText });
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === res.data._id ? res.data : msg
        ),
      }));
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/delete/${messageId}`);
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  searchMessages: async (chatId, query, type = 'user') => {
    try {
      const res = await axiosInstance.get(`/messages/search?chatId=${chatId}&query=${query}&type=${type}`);
      set({ searchResults: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  markAsRead: async (messageId) => {
    try {
      await axiosInstance.post(`/messages/read/${messageId}`);
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  },

  setSelectedUser: (user) => set({ selectedUser: user, selectedGroup: null }),
  setSelectedGroup: (group) => set({ selectedGroup: group, selectedUser: null }),
}));
