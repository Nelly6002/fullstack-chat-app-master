import Group from "../models/group.model.js";
import User from "../models/user.model.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const createdBy = req.user._id;

    // Ensure creator is in members
    if (!members.includes(createdBy.toString())) {
      members.push(createdBy);
    }

    const group = new Group({
      name,
      description,
      members,
      admins: [createdBy],
      createdBy,
    });

    await group.save();

    res.status(201).json(group);
  } catch (error) {
    console.log("Error in createGroup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({ members: userId }).populate('members', 'fullName profilePic');

    res.status(200).json(groups);
  } catch (error) {
    console.log("Error in getGroups controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const requesterId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.admins.includes(requesterId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (group.members.includes(userId)) {
      return res.status(400).json({ message: "User already in group" });
    }

    group.members.push(userId);
    await group.save();

    res.status(200).json({ message: "Member added" });
  } catch (error) {
    console.log("Error in addMember controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const requesterId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.admins.includes(requesterId) && userId !== requesterId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    group.members = group.members.filter(id => id.toString() !== userId);
    await group.save();

    res.status(200).json({ message: "Member removed" });
  } catch (error) {
    console.log("Error in removeMember controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};