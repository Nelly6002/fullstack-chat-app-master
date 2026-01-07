import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  editedMessage: null,
  replyTo: null,
  
setEditedMessage: (message) => set({ editedMessage: message }),
clearEditedMessage: () => set({ editedMessage: null }),
setReplyTo: (message) => set({ replyTo: message }),
clearReplyTo: () => set({ replyTo: null }),

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

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages, replyTo } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, { ...messageData, replyTo: replyTo?._id });
      set({ messages: [...messages, res.data], replyTo: null });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

 subscribeToMessages: () => {
  const { selectedUser } = get();
  if (!selectedUser) return;

  const socket = useAuthStore.getState().socket;

  socket.on("newMessage", (newMessage) => {
    const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
    if (!isMessageSentFromSelectedUser) return;

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
},


 unsubscribeFromMessages: () => {
  const socket = useAuthStore.getState().socket;
  socket.off("newMessage");
  socket.off("messageEdited");
  socket.off("messageDeleted");
},

 editMessage: async (messageId, newText) => {
  try {
    const res = await axiosInstance.put(`/messages/edit/${messageId}`, { text: newText });
    const updated = res.data;

    const socket = useAuthStore.getState().socket;
    socket.emit("editMessage", updated); 

    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === updated._id ? updated : msg
      ),
    }));
  } catch (error) {
    console.error(error);
    toast.error("Could not edit message");
  }
},

deleteMessage: async (messageId) => {
  try {
    await axiosInstance.delete(`/messages/delete/${messageId}`);
    set((state) => ({
      messages: state.messages.filter((msg) => msg._id !== messageId),
    }));
    toast.success("Message deleted");
  } catch (error) {
    console.error(error);
    toast.error("Could not delete message");
  }
},

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
