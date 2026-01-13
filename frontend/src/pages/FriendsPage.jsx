import { useState } from "react";
import AddFriend from "../components/AddFriend";
import FriendRequests from "../components/FriendRequests";
import { Users, UserPlus } from "lucide-react";

const FriendsPage = () => {
  const [activeTab, setActiveTab] = useState("add");

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto p-4">
        <div className="bg-base-100 rounded-lg shadow-lg max-w-2xl mx-auto">
          <div className="tabs tabs-boxed p-4">
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
          </div>

          <div className="p-4">
            {activeTab === "add" && <AddFriend />}
            {activeTab === "requests" && <FriendRequests />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;