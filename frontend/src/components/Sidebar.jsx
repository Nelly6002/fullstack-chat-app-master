import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, getGroups, groups, selectedGroup, setSelectedGroup } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
    getGroups();
  }, [getUsers, getGroups]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        {/* TODO: Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {/* Groups */}
        {groups.map((group) => (
          <button
            key={group._id}
            onClick={() => setSelectedGroup(group)}
            className={`
              w-full p-3 flex flex-col items-center gap-2 lg:flex-row lg:items-center lg:gap-3
              hover:bg-base-300 transition-colors
              ${selectedGroup?._id === group._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative">
              <img
                src={group.avatar || "/avatar.png"}
                alt={group.name}
                className="size-12 object-cover rounded-full"
              />
            </div>
            <div className="text-center lg:text-left min-w-0">
              <div className="font-medium truncate text-sm lg:text-base">{group.name}</div>
              <div className="text-xs text-zinc-400 hidden lg:block">{group.members.length} members</div>
            </div>
          </button>
        ))}

        {/* Users */}
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex flex-col items-center gap-2 lg:flex-row lg:items-center lg:gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info - visible on all screens */}
            <div className="text-center lg:text-left min-w-0">
              <div className="font-medium truncate text-sm lg:text-base">{user.fullName}</div>
              <div className="text-xs text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : `Last seen ${new Date(user.lastSeen).toLocaleString()}`}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && groups.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No contacts or groups</div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
