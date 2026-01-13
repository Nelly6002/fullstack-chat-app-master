import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createGroup, getGroups, addMember, removeMember } from "../controllers/group.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.get("/", protectRoute, getGroups);
router.post("/:groupId/add/:userId", protectRoute, addMember);
router.delete("/:groupId/remove/:userId", protectRoute, removeMember);

export default router;