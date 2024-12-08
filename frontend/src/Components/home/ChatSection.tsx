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
  const contact = [
    { sender: 'Obi-Wan Kenobi', time: '12:45', text: 'You were the Chosen One!', status: 'Delivered' },
    { sender: 'Anakin Skywalker', time: '12:46', text: 'I hate you!', status: 'Seen at 12:46' }
  ];
  const messages = [
    { sender: 'self', time: '12:45', text: 'You were the Chosen One!', status: 'Delivered' },
    { sender: 'Anakin Skywalker', time: '12:46', text: 'I hate you!', status: 'Seen at 12:46' },
    { sender: 'self', time: '12:45', text: 'You were the Chosen One!', status: 'Delivered' },
    { sender: 'Anakin Skywalker', time: '12:46', text: 'I hate you!', status: 'Seen at 12:46' },
    { sender: 'self', time: '12:45', text: 'You were the Chosen One!', status: 'Delivered' },
    { sender: 'Anakin Skywalker', time: '12:46', text: 'I hate you!', status: 'Seen at 12:46' },
    { sender: 'self', time: '12:45', text: 'You were the Chosen One!', status: 'Delivered' },
    { sender: 'Anakin Skywalker', time: '12:46', text: 'I hate you!', status: 'Seen at 12:46' },
    { sender: 'self', time: '12:45', text: 'You were the Chosen One!', status: 'Delivered' },
    { sender: 'Anakin Skywalker', time: '12:46', text: 'I hate you!', status: 'Seen at 12:46' },
    { sender: 'self', time: '12:45', text: 'You were the Chosen One!', status: 'Delivered' },
    { sender: 'Anakin Skywalker', time: '12:46', text: 'I hate you!', status: 'Seen at 12:46' },
    { sender: 'self', time: '12:45', text: 'You were the Chosen One!', status: 'Delivered' },
    { sender: 'Anakin Skywalker', time: '12:46', text: 'I hate you!', status: 'Seen at 12:46' },
    { sender: 'self', time: '12:45', text: 'You were the Chosen One!', status: 'Delivered' },
    { sender: 'Anakin Skywalker', time: '12:46', text: 'I hate you!', status: 'Seen at 12:46' },
  ];

  const userData = {
    profilePicture: 'https://via.placeholder.com/53',
    name: 'user001',
  }

  return (
    <div className="flex-col w-full h-full">
        <div className="flex items-center bg-black px-4 py-3 lg:h-[64px] sm-custom:h-[49px]">
        <img
          src={userData.profilePicture || "https://via.placeholder.com/50"}
          alt="User Profile"
          className="lg:w-10 lg:h-10 sm-custom:w-8 sm-custom:h-8 rounded-full"
        />
        <div className="ml-3">
          <h1 className="sm-custom:text-sm sm:text-sm lg:text-lg font-semibold text-white">
            {userData.name || "Username"}
          </h1>
        </div>
      </div>

    <div className="flex flex-col lg:h-[calc(100vh-128px)] sm-custom:h-[calc(100vh-110px)] w-full bg-blackv1">
       <div className="flex-1 bg-blackv1 p-6 sm-custom:p-[10px] sm:p-[18px] flex flex-col justify-start items-start overflow-y-auto scrollbar-thin scrollbar-thumb-blackv1 scrollbar-track-transparent">
            {/* If a contact is selected, show chat messages */}
            {contact ? (
              <div className="w-full">
                {/* Displaying Messages */}
                {messages.length > 0 ? (
                  messages.map((message, index) => (
                    <div key={index} className="flex items-start mb-4">
                      {/* Avatar */}
                      <div className={` ${message.sender === 'self' ? 'ml-auto' : ''}`}>
                        
                      </div>

                      {/* Message Content */}
                      <div className={`flex flex-col max-w-xs ${message.sender === 'self' ? 'items-end' : 'items-start'}`}>
                        {/* Chat Header */}
                        <div className={`chat-header text-sm font-semibold text-white ${message.sender === 'self' ? 'text-left' : 'text-left'}`}>
                          {message.sender}
                        </div>

                        {/* Chat Bubble */}
                        <div className={`rounded-lg p-2 ${message.sender === 'self' ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white'}`}>
                          {message.text}
                        </div>

                      </div>

                        
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No messages yet</p>
                )}
              </div>
            ) : (
              <p className="text-gray-400">Select a contact to start chatting!</p>
            )}
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
            className="w-full p-3 pl-4 pr-16 rounded-full bg-gray-800 text-white sm-custom:text-[12px] sm:text-[16px] focus:outline-none border border-blackv1"
          />

          {/* Picture Button inside the input box */}
          <button className="absolute top-1/2 sm:right-[80px] sm-custom:right-[60px] transform -translate-y-1/2 text-gray-400 hover:text-white">
            <FontAwesomeIcon icon={faImage} size="lg" />
          </button>

          {/* Send Button inside the input box */}
          <button
            onClick={handleSend}
            className="absolute top-1/2 sm:right-[40px] sm-custom:right-[20px] transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <FontAwesomeIcon icon={faPaperPlane} size="lg" />
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ChatSection;
