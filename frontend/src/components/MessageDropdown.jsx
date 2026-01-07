// components/MessageDropdown.jsx
const MessageDropdown = ({ isOwnMessage, onEdit, onDelete, onReply, onForward }) => {
  return (
    <div className="absolute right-0 top-full mt-1 bg-white border rounded shadow z-50 w-32 text-sm">
      <ul className="divide-y divide-gray-200">
        <li onClick={onReply} className="p-2 hover:bg-gray-100 cursor-pointer">Reply</li>
        <li onClick={onForward} className="p-2 hover:bg-gray-100 cursor-pointer">Forward</li>
        {isOwnMessage && (
          <>
            <li onClick={onEdit} className="p-2 hover:bg-gray-100 cursor-pointer">Edit</li>
            <li onClick={onDelete} className="p-2 hover:bg-gray-100 text-red-500 cursor-pointer">Delete</li>
          </>
        )}
      </ul>
    </div>
  );
};

export default MessageDropdown;
