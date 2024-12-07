import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faImage } from "@fortawesome/free-solid-svg-icons";

const ChatSection = () => {
  const [message, setMessage] = useState("");

  // Handle message input change
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  // Handle send button click
  const handleSend = () => {
    if (message.trim()) {
      console.log("Message Sent: ", message);
      setMessage(""); // Clear the message input after sending
    }
  };

  return (
    <div className="flex-1 bg-black p-6 flex flex-col justify-center items-center">
      {/* Chat Header */}
      <h2 className="text-3xl font-semibold mb-4 text-white">Welcome to H-Messenger</h2>
      <p className="text-gray-400 mb-4 text-center sm:text-left">Select a contact to start chatting!</p>

      {/* Message Input and Action Buttons */}
      <div className="w-full flex items-center space-x-4 mt-4">
        {/* Message Text Area with buttons inside */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={handleMessageChange}
            placeholder="Type your message..."
            className="w-full p-3 pl-4 pr-16 rounded-full bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ease-in-out"
          />
          
          {/* Picture Button inside the input box */}
          <button className="absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-400 hover:text-white">
            <FontAwesomeIcon icon={faImage} size="lg" />
          </button>

          {/* Send Button inside the input box */}
          <button
            onClick={handleSend}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <FontAwesomeIcon icon={faPaperPlane} size="lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
