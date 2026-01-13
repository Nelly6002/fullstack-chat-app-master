import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, status } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updateData.profilePic = uploadResponse.secure_url;
    }
    if (bio !== undefined) updateData.bio = bio;
    if (status !== undefined) updateData.status = status;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user._id;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: userId } },
        {
          $or: [
            { fullName: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        },
      ],
    }).select("fullName email profilePic");

    // For each user, check if they are friends, have pending request, etc.
    const userWithStatus = await Promise.all(
      users.map(async (user) => {
        const isFriend = await User.findOne({ _id: userId, friends: user._id });
        const sentRequest = await User.findOne({
          _id: user._id,
          "friendRequests.from": userId,
          "friendRequests.status": "pending",
        });
        const receivedRequest = await User.findOne({
          _id: userId,
          "friendRequests.from": user._id,
          "friendRequests.status": "pending",
        });

        let status = "none";
        if (isFriend) status = "friend";
        else if (sentRequest) status = "request_sent";
        else if (receivedRequest) status = "request_received";

        // Calculate mutual friends
        const myFriends = await User.findById(userId).select("friends");
        const theirFriends = await User.findById(user._id).select("friends");
        const mutualFriends = myFriends.friends.filter((friend) =>
          theirFriends.friends.includes(friend)
        ).length;

        return {
          ...user.toObject(),
          status,
          mutualFriends,
        };
      })
    );

    res.status(200).json(userWithStatus);
  } catch (error) {
    console.log("Error in searchUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const senderId = req.user._id;

    if (userId === senderId.toString()) {
      return res.status(400).json({ message: "Cannot send request to yourself" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already friends
    const isFriend = await User.findOne({ _id: senderId, friends: userId });
    if (isFriend) {
      return res.status(400).json({ message: "Already friends" });
    }

    // Check if request already sent
    const existingRequest = user.friendRequests.find(
      (req) => req.from.toString() === senderId.toString() && req.status === "pending"
    );
    if (existingRequest) {
      return res.status(400).json({ message: "Request already sent" });
    }

    user.friendRequests.push({ from: senderId, status: "pending" });
    await user.save();

    // Emit socket event for notification
    const { io, getReceiverSocketId } = await import("../lib/socket.js");
    const receiverSocketId = getReceiverSocketId(userId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friendRequest", { from: senderId, type: "received" });
    }

    res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    console.log("Error in sendFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const accepterId = req.user._id;

    const user = await User.findById(accepterId);
    const requestIndex = user.friendRequests.findIndex(
      (req) => req.from.toString() === userId && req.status === "pending"
    );

    if (requestIndex === -1) {
      return res.status(400).json({ message: "No pending request" });
    }

    user.friendRequests[requestIndex].status = "accepted";
    user.friends.push(userId);
    await user.save();

    // Add to sender's friends
    await User.findByIdAndUpdate(userId, { $push: { friends: accepterId } });

    // Emit socket event
    const { io, getReceiverSocketId } = await import("../lib/socket.js");
    const receiverSocketId = getReceiverSocketId(userId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friendRequest", { from: accepterId, type: "accepted" });
    }

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const declinerId = req.user._id;

    const user = await User.findById(declinerId);
    const requestIndex = user.friendRequests.findIndex(
      (req) => req.from.toString() === userId && req.status === "pending"
    );

    if (requestIndex === -1) {
      return res.status(400).json({ message: "No pending request" });
    }

    user.friendRequests[requestIndex].status = "declined";
    await user.save();

    res.status(200).json({ message: "Friend request declined" });
  } catch (error) {
    console.log("Error in declineFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("friendRequests.from", "fullName profilePic");
    const pendingRequests = user.friendRequests.filter((req) => req.status === "pending");

    res.status(200).json(pendingRequests);
  } catch (error) {
    console.log("Error in getFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("friends", "fullName profilePic");

    res.status(200).json(user.friends);
  } catch (error) {
    console.log("Error in getFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
