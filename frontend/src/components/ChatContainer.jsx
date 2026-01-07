import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import MessageDropdown from "./MessageDropdown";
const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    setEditedMessage,
    deleteMessage,
    setReplyTo,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const dropdownRef = useRef(null);

const [activeDropdownId, setActiveDropdownId] = useState(null); 
  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    console.log("Messages:",messages);
    
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target)
    ) {
      setActiveDropdownId(null);
    }
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
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

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
