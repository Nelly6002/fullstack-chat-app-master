import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Search, UserPlus, UserCheck, UserX } from "lucide-react";
import toast from "react-hot-toast";
import { debounce } from "lodash";

const AddFriend = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchUsers, sendFriendRequest, acceptFriendRequest, declineFriendRequest } = useAuthStore();

  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleSendRequest = async (userId) => {
    await sendFriendRequest(userId);
    // Update status in results
    setSearchResults((prev) =>
      prev.map((user) =>
        user._id === userId ? { ...user, status: "request_sent" } : user
      )
    );
  };

  const handleAcceptRequest = async (userId) => {
    await acceptFriendRequest(userId);
    // Update status
    setSearchResults((prev) =>
      prev.map((user) =>
        user._id === userId ? { ...user, status: "friend" } : user
      )
    );
  };

  const handleDeclineRequest = async (userId) => {
    await declineFriendRequest(userId);
    // Update status
    setSearchResults((prev) =>
      prev.map((user) =>
        user._id === userId ? { ...user, status: "none" } : user
      )
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Add Friends</h2>

      <form>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 input input-bordered input-sm"
          />
          {isSearching && <div className="loading loading-spinner loading-sm"></div>}
        </div>
      </form>

      <div className="space-y-2">
        {searchResults.map((user) => (
          <div key={user._id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
            <div className="flex items-center gap-3">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullName}
                className="size-10 rounded-full"
              />
              <div>
                <div className="font-medium">{user.fullName}</div>
                <div className="text-sm text-zinc-400">{user.email}</div>
                {user.mutualFriends > 0 && (
                  <div className="text-xs text-blue-500">{user.mutualFriends} mutual friends</div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {user.status === "friend" && (
                <button className="btn btn-xs btn-success" disabled>
                  <UserCheck size={16} />
                  Friends
                </button>
              )}
              {user.status === "request_sent" && (
                <button className="btn btn-xs btn-warning" disabled>
                  Request Sent
                </button>
              )}
              {user.status === "request_received" && (
                <>
                  <button
                    onClick={() => handleAcceptRequest(user._id)}
                    className="btn btn-xs btn-success"
                  >
                    <UserCheck size={16} />
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(user._id)}
                    className="btn btn-xs btn-error"
                  >
                    <UserX size={16} />
                    Decline
                  </button>
                </>
              )}
              {user.status === "none" && (
                <button
                  onClick={() => handleSendRequest(user._id)}
                  className="btn btn-xs btn-primary"
                >
                  <UserPlus size={16} />
                  Add
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddFriend;