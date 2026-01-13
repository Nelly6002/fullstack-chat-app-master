import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import MessageDropdown from "./MessageDropdown";
import { Search, X } from "lucide-react";
const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    selectedGroup,
    subscribeToMessages,
    unsubscribeFromMessages,
    setEditedMessage,
    deleteMessage,
    setReplyTo,
    typingUsers,
    searchMessages,
    searchResults,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const dropdownRef = useRef(null);

  const [activeDropdownId, setActiveDropdownId] = useState(null); 
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const chatId = selectedUser ? selectedUser._id : selectedGroup?._id;
  const chatType = selectedUser ? 'user' : 'group';

  useEffect(() => {
    if (chatId) {
      getMessages(chatId, chatType);
      subscribeToMessages();
    }

    return () => unsubscribeFromMessages();
  }, [chatId, chatType, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    console.log("Messages:",messages);
    
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
useEffect(() => {
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    await searchMessages(chatId, query, chatType);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }


  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      {/* Search Bar */}
      <div className="p-2 border-b border-base-300">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="w-full input input-bordered input-sm"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-xs"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <Search size={20} className="text-base-content/70" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {(isSearching ? searchResults : messages).map((message) => {
  const isOwnMessage = message.senderId === authUser._id;
  const showDropdown = activeDropdownId === message._id;

  return (
    <div
      key={message._id}
      className={`relative chat ${isOwnMessage ? "chat-end" : "chat-start"}`}
      ref={messageEndRef}
    >
      <div className="chat-image avatar">
        <div className="size-10 rounded-full border">
          <img
            src={
              isOwnMessage
                ? authUser.profilePic || "/avatar.png"
                : selectedUser.profilePic || "/avatar.png"
            }
            alt="profile pic"
          />
        </div>
      </div>

      <div
        className="chat-bubble flex flex-col relative cursor-pointer"
        onClick={() =>
          setActiveDropdownId(showDropdown ? null : message._id)
        }
      >
        {message.replyTo && (
          <div className="text-xs text-gray-500 mb-1 border-l-2 border-gray-300 pl-2">
            Replying to: {message.replyTo.text || "Image"}
          </div>
        )}
        {message.image && (
          <img
            src={message.image}
            alt="Attachment"
            className="sm:max-w-[200px] rounded-md mb-2"
          />
        )}
        {message.text && <p>{message.text}</p>}
        {message.edited && <span className="text-xs text-gray-400">(edited)</span>}

        {/* Read Receipt */}
        {isOwnMessage && message.readBy && message.readBy.length > 0 && (
          <div className="text-xs text-blue-500 mt-1">
            ✓ Read by {message.readBy.length} {message.readBy.length === 1 ? 'person' : 'people'}
          </div>
        )}

        {/* Dropdown */}
       {showDropdown && (
  <div ref={dropdownRef}>
    <MessageDropdown
      isOwnMessage={isOwnMessage}
      onReply={() => {
        setReplyTo(message);
        setActiveDropdownId(null);
      }}
      onForward={() => {
        // For now, copy the message text to input
        // In a real app, this would open a user selector
        navigator.clipboard.writeText(message.text || "Image");
        toast.success("Message copied to clipboard");
        setActiveDropdownId(null);
      }}
    onEdit={() => {
      console.log("Setting edited message:", message);
    setEditedMessage(message);
    setActiveDropdownId(null);
  }}
      onDelete={() => {
        deleteMessage(message._id);
        setActiveDropdownId(null);
      }}
    />
  </div>
)}
      </div>

      <div className="chat-header mb-1">
        <time className="text-xs opacity-50 ml-1">
          {formatMessageTime(message.createdAt)}
        </time>
      </div>
    </div>
  );
})}

      </div>

      {typingUsers.size > 0 && (
        <div className="text-sm text-zinc-400 italic px-4">
          {Array.from(typingUsers).join(", ")} is typing...
        </div>
      )}

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
