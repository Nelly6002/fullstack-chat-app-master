import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { UserMinus, MessageCircle } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const MyFriends = () => {
    const { getFriends, removeFriend } = useAuthStore();
    const { setSelectedUser } = useChatStore();
    const [friends, setFriends] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const data = await getFriends();
                setFriends(data);
            } catch (error) {
                console.error("Failed to fetch friends", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFriends();
    }, [getFriends]);

    const handleRemoveFriend = async (friendId) => {
        if (!window.confirm("Are you sure you want to remove this friend?")) return;
        await removeFriend(friendId);
        setFriends((prev) => prev.filter((f) => f._id !== friendId));
    };

    const handleMessage = (friend) => {
        setSelectedUser(friend);
        // Ideally navigate to chat or open sidebar
    };

    if (isLoading) {
        return <div className="loading loading-spinner loading-lg block mx-auto mt-10"></div>;
    }

    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">My Friends</h2>
            <div className="space-y-2">
                {friends.length === 0 ? (
                    <div className="text-center text-zinc-500 py-8">
                        You haven't added any friends yet.
                    </div>
                ) : (
                    friends.map((friend) => (
                        <div key={friend._id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <img
                                    src={friend.profilePic || "/avatar.png"}
                                    alt={friend.fullName}
                                    className="size-10 rounded-full object-cover"
                                />
                                <div>
                                    <div className="font-medium">{friend.fullName}</div>
                                    <div className="text-sm text-zinc-400">{friend.email}</div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleRemoveFriend(friend._id)}
                                    className="btn btn-xs btn-error btn-outline"
                                >
                                    <UserMinus size={16} />
                                    Unfriend
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyFriends;
