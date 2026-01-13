import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { sendMessage, editedMessage, clearEditedMessage, editMessage, replyTo, clearReplyTo, selectedUser, selectedGroup } = useChatStore();
  const { socket } = useAuthStore();

  const handleTyping = (isTyping) => {
    if (!socket) return;
    const to = selectedUser ? selectedUser._id : selectedGroup?._id;
    if (to) {
      socket.emit("typing", { to, isTyping });
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    handleTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => handleTyping(false), 1000);
  };

  useEffect(() => {
    if (editedMessage) {
      console.log("Editing message ID:",editedMessage._id);
      setText(editedMessage.text);
    }
  }, [editedMessage]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    try {
      // Compress the image
      const options = {
        maxSizeMB: 1, // Maximum size in MB
        maxWidthOrHeight: 1920, // Maximum width or height
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error compressing image:", error);
      toast.error("Failed to compress image");
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!text.trim() && !imagePreview) return;
  if (isSending) return;

  setIsSending(true);
  try {
    if (editedMessage) {
      await editMessage(editedMessage._id, text.trim());
      clearEditedMessage(); // You'll create this below if you haven’t
    } else {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });
    }

    // Clear form
    setText("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  } catch (error) {
    console.error("Failed to send message:", error);
  } finally {
    setIsSending(false);
  }
};


  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}
{editedMessage && (
  <div className="text-sm text-gray-500 mb-1">
    Editing message...{" "}
    <button onClick={clearEditedMessage} className="text-blue-500 hover:underline">
      Cancel
    </button>
  </div>
)}

{replyTo && (
  <div className="text-sm text-gray-500 mb-1 bg-gray-100 p-2 rounded">
    Replying to: {replyTo.text || "Image"}
    <button onClick={clearReplyTo} className="text-blue-500 hover:underline ml-2">
      Cancel
    </button>
  </div>
)}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={handleTextChange}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={(!text.trim() && !imagePreview) || isSending}
        >
          {isSending ? <div className="loading loading-spinner loading-sm"></div> : <Send size={22} />}
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
