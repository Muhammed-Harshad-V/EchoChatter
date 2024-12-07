import React from "react";

const ChatSection = () => {
  return (
    <div className="flex-1 bg-black p-6 flex flex-col justify-center items-center">
      {/* Chat Header */}
      <h2 className="text-3xl font-semibold mb-4 text-white">Welcome to H-Messenger</h2>
      <p className="text-gray-400">Select a contact to start chatting!</p>
    </div>
  );
};

export default ChatSection;
