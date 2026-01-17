import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { axiosInstance } from "../lib/axios";
import { Users, Plus } from "lucide-react";
import toast from "react-hot-toast";

const CreateGroup = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const { authUser } = useAuthStore();
  const { users } = useChatStore();
  const navigate = useNavigate();

  const handleCreateGroup = async () => {
    if (!name.trim()) return toast.error("Group name is required");
    if (selectedFriends.length === 0) return toast.error("Select at least one friend");

    setIsCreating(true);
    try {
      const res = await axiosInstance.post("/groups/create", { name, description, members: selectedFriends });
      toast.success("Group created!");
      useChatStore.getState().getGroups(); // Refresh groups list
      useChatStore.getState().setSelectedGroup(res.data); // Select the new group
      navigate("/"); // Go to home/chat
    } catch (error) {
      toast.error("Failed to create group");
    } finally {
      setIsCreating(false);
    }
  };

  const toggleFriend = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Create Group</h2>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input input-bordered w-full"
        />
        <textarea
          placeholder="Group description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea textarea-bordered w-full"
          rows={3}
        />

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Select Friends</span>
            <span className="label-text-alt">{selectedFriends.length} selected</span>
          </label>
          <div className="border border-base-300 rounded-lg p-2 h-48 overflow-y-auto space-y-2 bg-base-100">
            {users.map((user) => (
              <label key={user._id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFriends.includes(user._id)}
                  onChange={() => toggleFriend(user._id)}
                  className="checkbox"
                />
                <img src={user.profilePic || "/avatar.png"} alt={user.fullName} className="size-8 rounded-full" />
                <span>{user.fullName}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreateGroup}
          className="btn btn-primary w-full"
          disabled={isCreating}
        >
          {isCreating ? "Creating..." : "Create Group"}
        </button>
      </div>
    </div>
  );
};

export default CreateGroup;