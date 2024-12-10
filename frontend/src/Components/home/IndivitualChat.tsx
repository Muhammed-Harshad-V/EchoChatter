import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faImage } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";

// Define the WebSocket URL (change as needed)
const socketUrl = "ws://localhost:3000";  // Replace with your server WebSocket URL

const IndivitualChat = () => {
  const { username } = useParams<{ username: string }>();
  const self = "dev";  // The current user (change as necessary)

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);  // To store the WebSocket connection

  // Handle message input change
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  // Handle send button click
  const handleSend = () => {
    if (message.trim() && socket) {
      // Send the message to the WebSocket server
      const messageData = { sender: self, recipient: username, text: message };
      socket.send(JSON.stringify(messageData)); // Send as JSON string
      setMessages([...messages, { sender: self, text: message }]); // Add to local chat
      setMessage(""); // Clear input after sending
    }
  };

  // Handle WebSocket connection and events
  useEffect(() => {
    // Initialize WebSocket connection
    const socketConnection = new WebSocket(socketUrl + "/" + username + "/" + self);  // Append username to URL if needed

    // Store the WebSocket connection in state
    setSocket(socketConnection);

    // Listen for the WebSocket connection open event
    socketConnection.onopen = () => {
      console.log(`WebSocket connection established with ${username}`);
      // Optionally, send a message on connect if needed
      socketConnection.send(
        JSON.stringify({ sender: self, recipient: username, text: "joined the chat" })
      );
    };

    // Listen for incoming messages from other users
    socketConnection.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, msg]); // Append new message
    };

    // Handle WebSocket errors
    socketConnection.onerror = (error) => {
      console.error("WebSocket Error: ", error);
    };

    // Cleanup WebSocket connection when the component is unmounted
    return () => {
      if (socketConnection) {
        socketConnection.close(); // Close WebSocket connection on cleanup
        console.log("WebSocket disconnected");
      }
    };
  }, [username]);  // Dependency on username to handle when it changes

  const userData = {
    profilePicture: "https://via.placeholder.com/53",
    name: username || "Username",  // Display the username dynamically
  };

  return (
    <div className="flex-col w-full h-full">
      {/* Header with User Profile */}
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

      {/* Chat Messages Section */}
      <div className="flex flex-col lg:h-[calc(100vh-128px)] sm-custom:h-[calc(100vh-110px)] w-full bg-blackv1">
        <div className="flex-1 bg-blackv1 p-6 sm-custom:p-[10px] sm:p-[18px] flex flex-col justify-start items-start overflow-y-auto scrollbar-thin scrollbar-thumb-blackv1 scrollbar-track-transparent">
          {/* Displaying Messages */}
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <div key={index} className="flex items-start mb-4">
                {/* Message Content */}
                <div className={`flex flex-col max-w-xs ${message.sender === self ? "items-end" : "items-start"}`}>
                  {/* Chat Header */}
                  <div className="chat-header text-sm font-semibold text-white text-left">
                    {message.sender}
                  </div>

                  {/* Chat Bubble */}
                  <div className={`rounded-lg p-2 ${message.sender === self ? "bg-blue-500 text-white" : "bg-gray-600 text-white"}`}>
                    {message.text}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No messages yet</p>
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

export default IndivitualChat;

