import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { UserCheck, UserX } from "lucide-react";

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getFriendRequests, acceptFriendRequest, declineFriendRequest } = useAuthStore();

  useEffect(() => {
    const fetchRequests = async () => {
      const data = await getFriendRequests();
      setRequests(data);
      setIsLoading(false);
    };
    fetchRequests();
  }, []);

  const handleAccept = async (userId) => {
    await acceptFriendRequest(userId);
    setRequests((prev) => prev.filter((req) => req.from._id !== userId));
  };

  const handleDecline = async (userId) => {
    await declineFriendRequest(userId);
    setRequests((prev) => prev.filter((req) => req.from._id !== userId));
  };

  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Friend Requests</h2>

      {requests.length === 0 ? (
        <p className="text-zinc-500">No pending friend requests</p>
      ) : (
        <div className="space-y-2">
          {requests.map((request) => (
            <div key={request._id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
              <div className="flex items-center gap-3">
                <img
                  src={request.from.profilePic || "/avatar.png"}
                  alt={request.from.fullName}
                  className="size-10 rounded-full"
                />
                <div>
                  <div className="font-medium">{request.from.fullName}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(request.from._id)}
                  className="btn btn-xs btn-success"
                >
                  <UserCheck size={16} />
                  Accept
                </button>
                <button
                  onClick={() => handleDecline(request.from._id)}
                  className="btn btn-xs btn-error"
                >
                  <UserX size={16} />
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendRequests;