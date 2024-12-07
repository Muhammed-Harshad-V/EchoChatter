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
    <div className="flex flex-col h-full w-full bg-black">
      {/* Chat Header */}
      <div className="flex-1 bg-black p-6 flex flex-col justify-center items-center overflow-y-auto scrollbar-thin scrollbar-thumb-blackv1 scrollbar-track-transparent">
        <h2 className="text-3xl font-semibold mb-4 text-white">Welcome to H-Messenger</h2>
        <p className="text-gray-400 mb-4 text-center sm:text-left">Select a contact to start chatting!</p>
      </div>

      {/* Message Input and Action Buttons */}
      <div className="flex items-center p-4 bg-black border-gray-600">
        {/* Message Text Area with buttons inside */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={handleMessageChange}
            placeholder="Type your message..."
            className="w-full p-3 pl-4 pr-16 rounded-full bg-gray-800 text-white focus:outline-none border border-blackv1"
          />

          {/* Picture Button inside the input box */}
          <button className="absolute top-1/2 right-[80px] transform -translate-y-1/2 text-gray-400 hover:text-white">
            <FontAwesomeIcon icon={faImage} size="lg" />
          </button>

          {/* Send Button inside the input box */}
          <button
            onClick={handleSend}
            className="absolute top-1/2 right-[40px] transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <FontAwesomeIcon icon={faPaperPlane} size="lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
