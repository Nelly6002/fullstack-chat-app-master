import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "Hey there! I'm using Chatty",
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    friends: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    friendRequests: [{
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "accepted", "declined"],
        default: "pending",
      },
    }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
