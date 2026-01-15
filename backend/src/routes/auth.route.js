import express from "express";
import { checkAuth, login, logout, signup, updateProfile, searchUsers, sendFriendRequest, acceptFriendRequest, declineFriendRequest, getFriendRequests, getFriends, removeFriend } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

router.get("/search", protectRoute, searchUsers);
router.post("/friend-request/:userId", protectRoute, sendFriendRequest);
router.post("/accept-friend/:userId", protectRoute, acceptFriendRequest);
router.post("/decline-friend/:userId", protectRoute, declineFriendRequest);
router.post("/remove-friend/:userId", protectRoute, removeFriend);
router.get("/friend-requests", protectRoute, getFriendRequests);
router.get("/friends", protectRoute, getFriends);

export default router;
