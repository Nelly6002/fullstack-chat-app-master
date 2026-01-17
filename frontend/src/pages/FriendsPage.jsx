import { useState } from "react";
import AddFriend from "../components/AddFriend";
import FriendRequests from "../components/FriendRequests";
import CreateGroup from "../components/CreateGroup";
import MyFriends from "../components/MyFriends";
import { Users, UserPlus, MessageSquare, UserCheck } from "lucide-react";

const FriendsPage = () => {
  const [activeTab, setActiveTab] = useState("my-friends");

  return (
    <div className="min-h-screen bg-base-200 pt-20">
      <div className="container mx-auto p-4">
        <div className="bg-base-100 rounded-lg shadow-lg max-w-2xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <button
              className={`btn ${activeTab === "my-friends" ? "btn-primary" : "btn-ghost"} w-full justify-start gap-3`}
              onClick={() => setActiveTab("my-friends")}
            >
              <UserCheck size={20} />
              <span className="hidden sm:inline">My Friends</span>
              <span className="sm:hidden">Friends</span>
            </button>
            <button
              className={`btn ${activeTab === "add" ? "btn-primary" : "btn-ghost"} w-full justify-start gap-3`}
              onClick={() => setActiveTab("add")}
            >
              <UserPlus size={20} />
              Add Friend
            </button>
            <button
              className={`btn ${activeTab === "requests" ? "btn-primary" : "btn-ghost"} w-full justify-start gap-3`}
              onClick={() => setActiveTab("requests")}
            >
              <Users size={20} />
              Requests
            </button>
            <button
              className={`btn ${activeTab === "group" ? "btn-primary" : "btn-ghost"} w-full justify-start gap-3`}
              onClick={() => setActiveTab("group")}
            >
              <MessageSquare size={20} />
              Create Group
            </button>
          </div>

          <div className="p-4">
            {activeTab === "my-friends" && <MyFriends />}
            {activeTab === "add" && <AddFriend />}
            {activeTab === "requests" && <FriendRequests />}
            {activeTab === "group" && <CreateGroup />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;