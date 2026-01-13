import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const user = await User.findById(loggedInUserId).populate('friends', 'fullName profilePic');
    const filteredUsers = user.friends;

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const { type, page = 1, limit = 50 } = req.query; // Add pagination
    const myId = req.user._id;
    const skip = (page - 1) * limit;

    let messages;
    if (type === 'group') {
      // Check if user is member of group
      const Group = (await import("../models/group.model.js")).default;
      const group = await Group.findById(chatId);
      if (!group || !group.members.includes(myId)) {
        return res.status(403).json({ message: "Not a member of this group" });
      }
      messages = await Message.find({ groupId: chatId, deleted: false }).populate('replyTo senderId').sort({ createdAt: -1 }).skip(skip).limit(limit);
    } else {
      messages = await Message.find({
        $or: [
          { senderId: myId, receiverId: chatId },
          { senderId: chatId, receiverId: myId },
        ],
        deleted: false,
      }).populate('replyTo').sort({ createdAt: -1 }).skip(skip).limit(limit);
    }

    // Reverse to show oldest first
    messages.reverse();

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, replyTo, type, chatId } = req.body; // type: 'user' or 'group'
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      text,
      image: imageUrl,
      replyTo,
    });

    if (type === 'group') {
      newMessage.groupId = chatId;
      // Check membership
      const Group = (await import("../models/group.model.js")).default;
      const group = await Group.findById(chatId);
      if (!group || !group.members.includes(senderId)) {
        return res.status(403).json({ message: "Not a member of this group" });
      }
    } else {
      newMessage.receiverId = chatId;
    }

    await newMessage.save();

    // Populate replyTo if exists
    await newMessage.populate('replyTo senderId');

    const receiverSocketId = getReceiverSocketId(chatId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // For groups, emit to all members
    if (type === 'group') {
      const Group = (await import("../models/group.model.js")).default;
      const group = await Group.findById(chatId).populate('members');
      group.members.forEach(member => {
        if (member._id.toString() !== senderId.toString()) {
          const socketId = getReceiverSocketId(member._id.toString());
          if (socketId) {
            io.to(socketId).emit("newMessage", newMessage);
          }
        }
      });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message || message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Cannot edit this message" });
    }

    // Check time limit: 5 minutes
    const timeDiff = Date.now() - new Date(message.createdAt).getTime();
    if (timeDiff > 5 * 60 * 1000) {
      return res.status(400).json({ message: "Cannot edit message after 5 minutes" });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      {
        text,
        edited: true,
        editedAt: new Date(),
      },
      { new: true }
    );

    // Emit to receiver or group members
    if (updatedMessage.groupId) {
      const Group = (await import("../models/group.model.js")).default;
      const group = await Group.findById(updatedMessage.groupId).populate('members');
      group.members.forEach(member => {
        const socketId = getReceiverSocketId(member._id.toString());
        if (socketId) {
          io.to(socketId).emit("messageEdited", updatedMessage);
        }
      });
    } else {
      const receiverSocketId = getReceiverSocketId(updatedMessage.receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageEdited", updatedMessage);
      }
    }

    res.status(200).json(updatedMessage);
  } catch (error) {
    console.log("Error in editMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message || message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Cannot delete this message" });
    }

    // Check time limit: 5 minutes
    const timeDiff = Date.now() - new Date(message.createdAt).getTime();
    if (timeDiff > 5 * 60 * 1000) {
      return res.status(400).json({ message: "Cannot delete message after 5 minutes" });
    }

    await Message.findByIdAndUpdate(messageId, {
      deleted: true,
      deletedAt: new Date(),
    });

    // Emit to receiver or group members
    if (message.groupId) {
      const Group = (await import("../models/group.model.js")).default;
      const group = await Group.findById(message.groupId).populate('members');
      group.members.forEach(member => {
        const socketId = getReceiverSocketId(member._id.toString());
        if (socketId) {
          io.to(socketId).emit("messageDeleted", messageId);
        }
      });
    } else {
      const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageDeleted", messageId);
      }
    }

    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    console.log("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const searchMessages = async (req, res) => {
  try {
    const { chatId, query, type } = req.query;
    const userId = req.user._id;

    let filter = { deleted: false, text: { $regex: query, $options: "i" } };

    if (type === 'group') {
      filter.groupId = chatId;
      // Check membership
      const Group = (await import("../models/group.model.js")).default;
      const group = await Group.findById(chatId);
      if (!group || !group.members.includes(userId)) {
        return res.status(403).json({ message: "Not a member of this group" });
      }
    } else {
      filter.$or = [
        { senderId: userId, receiverId: chatId },
        { senderId: chatId, receiverId: userId },
      ];
    }

    const messages = await Message.find(filter).populate('senderId').sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in searchMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user can read this message
    let canRead = false;
    if (message.groupId) {
      const Group = (await import("../models/group.model.js")).default;
      const group = await Group.findById(message.groupId);
      canRead = group && group.members.includes(userId);
    } else {
      canRead = message.senderId.toString() === userId.toString() || message.receiverId.toString() === userId.toString();
    }

    if (!canRead) {
      return res.status(403).json({ message: "Cannot read this message" });
    }

    // Add to readBy if not already
    const alreadyRead = message.readBy.some(read => read.userId.toString() === userId.toString());
    if (!alreadyRead) {
      message.readBy.push({ userId });
      await message.save();
    }

    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    console.log("Error in markAsRead controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

