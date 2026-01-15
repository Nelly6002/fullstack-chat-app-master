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
          <div className="tabs tabs-boxed p-4 flex-wrap justify-center sm:justify-start">
            <button
              className={`tab ${activeTab === "my-friends" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("my-friends")}
            >
              <UserCheck size={16} className="mr-2" />
              My Friends
            </button>
            <button
              className={`tab ${activeTab === "add" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("add")}
            >
              <UserPlus size={16} className="mr-2" />
              Add Friends
            </button>
            <button
              className={`tab ${activeTab === "requests" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("requests")}
            >
              <Users size={16} className="mr-2" />
              Requests
            </button>
            <button
              className={`tab ${activeTab === "group" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("group")}
            >
              <MessageSquare size={16} className="mr-2" />
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