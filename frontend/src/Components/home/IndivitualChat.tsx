import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faImage } from "@fortawesome/free-solid-svg-icons";
import { FixedSizeList as List } from "react-window";
import { useGlobalState } from "../../context/ContactsProvider";
import { socketuri } from "../../api/api";

interface Message {
  sender: string;
  content: string;
  timestamp: number;
}

const socketUrl = socketuri;

const IndivitualChat = () => {
  const { chatId } = useParams<{ chatId: string }>(); // Capture dynamic chatId from URL
  const self = localStorage.getItem("username"); // The current user (change as necessary)
  const { fetchContacts } = useGlobalState();
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null); // To store the WebSocket connection

  const listRef = useRef<List | null>(null); // Ref for the List component

  // Determine if it's a group or private chat
  const isGroupChat = chatId && chatId.includes("group"); // Check if the chatId starts with 'group'
  const chatIdentifier = isGroupChat ? chatId.split("-").slice(1).join("-") : chatId; // Remove "group:" prefix if it's a group chat

  // Clear previous messages when changing chats
  useEffect(() => {
    setMessages([]); // Clear previous messages when changing chats

    // Dynamically set the WebSocket connection URL
    const socketConnection = new WebSocket(`${socketUrl}/${self}/${chatIdentifier}`);
    console.log(socketConnection);

    setSocket(socketConnection);

    socketConnection.onopen = () => {
      console.log(`WebSocket connection established with ${chatIdentifier}`);
      socketConnection.send(
        JSON.stringify({
          sender: self,
          recipient: chatIdentifier,
          text: `joined the chat`,
        })
      );
    };

    socketConnection.onmessage = (event: MessageEvent) => {
      try {
        let data = JSON.parse(event.data);

        // If the incoming data is an array, make sure it’s processed as an array
        data = Array.isArray(data) ? data : [data];

        console.log(data);

        // Check if the incoming data contains messages and/or notifications
        data.forEach((item: { type: string; message?: string; messages?: Message[] }) => {
          if (item.type === "contact-update") {
            console.log("Notification:", item.message);
            fetchContacts();
          }

          if (item.type === "new-group-chat") {
            console.log("New message notification:", item.message);
            fetchContacts();
          }

          // Handle other types of incoming data, like chat messages
          if (Array.isArray(item.messages)) {
            const incomingMessages = item.messages.map((message: Message) => ({
              sender: message.sender,
              content: message.content,
              timestamp: message.timestamp,
            }));
            setMessages((prevMessages) => [...prevMessages, ...incomingMessages]);
          }
        });
      } catch (error) {
        console.error("Error processing incoming message:", error);
      }
    };

    socketConnection.onerror = (error) => {
      console.error("WebSocket Error: ", error);
    };

    return () => {
      if (socketConnection) {
        socketConnection.close();
        console.log("WebSocket disconnected");
      }
    };
  }, [chatIdentifier, fetchContacts, self]); // Dependencies: when chatIdentifier changes (either username or groupname)

  const renderMessage = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const message = messages[index];
    const isSender = message.sender === self;

    // Format timestamp to human-readable format
    const formattedTime = new Date(message.timestamp).toLocaleString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return (
      <div key={index} style={{ ...style, paddingBottom: "16px" }} className={`flex items-start mb-6`}>
        <div className={`${isSender ? "ml-auto" : ""}`}>
          <div className={`flex flex-col max-w-xs ${isSender ? "items-end" : "items-start"}`}>
            {/* Display sender's name only for group chat */}
            {isGroupChat && !isSender && (
              <div className="text-xs text-gray-400 mb-1">{message.sender}</div>
            )}

            <div
              className={`rounded-lg p-1 flex ${isSender ? "bg-blue-500 text-white" : "bg-gray-600 text-white"} sm:max-w-[300px] sm-custom:max-w-[200px] lg:max-w-[400px] break-all`}
            >
              {message.content}
            </div>

            <div className="text-[10px] text-gray-400 mt-1 pb-2">{formattedTime}</div>
          </div>
        </div>
      </div>
    );
  };

  // Scroll to bottom logic when new messages arrive
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(messages.length - 1); // Scroll to the last message
    }
  }, [messages]); // Trigger scroll when messages change

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSend = () => {
    // Ensure 'self' is a valid string
    const sender = self || "UnknownUser"; // Default to a placeholder name if 'self' is null

    if (message.trim() && socket) {
      const messageData = {
        type: isGroupChat ? "group" : "private", // Dynamic type based on chat type
        sender: sender, // Use the non-null sender
        receiver: chatIdentifier,
        content: message,
      };

      console.log(messageData);
      socket.send(JSON.stringify(messageData)); // Send message via WebSocket

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: sender, content: message, timestamp: Date.now() },
      ]);

      setMessage(""); // Clear input field
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const userData = {
    profilePicture: "https://via.placeholder.com/53",
    name: chatIdentifier, // For group chat, show group name
  };

  return (
    <div className="flex-col w-full h-[calc(100vh-109px)]">  
      <div className="flex items-center bg-black px-4 py-3 h-[49px]">
        <img
          src={userData.profilePicture || "https://via.placeholder.com/50"}
          alt="User Profile"
          className="w-8 h-8 rounded-full"
        />
        <div className="ml-3">
          <h1 className="text-sm font-semibold text-white">
            {userData.name || chatIdentifier}
          </h1>
        </div>
      </div>

      <div className="flex flex-col lg:h-[calc(100vh-128px)] sm-custom:h-[calc(100vh-110px)] w-full bg-blackv1">
        <div className="flex-1 bg-blackv1 p-6 sm-custom:p-[10px] sm:p-[18px] flex flex-col justify-start items-start">
          <List
            ref={listRef} // Attach the ref to the List component
            height={window.innerHeight - 228} // Adjust the height according to your layout
            itemCount={messages.length}
            itemSize={80} // Adjust item height as per your design
            width="100%"
            className="overflow-y-auto scrollbar-thin scrollbar-none scrollbar-track-transparent"
          >
            {renderMessage}
          </List>
        </div>

        <div className="flex items-center p-4 bg-black border-gray-600">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={handleMessageChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full p-3 pl-4 pr-16 rounded-full bg-gray-800 text-white sm-custom:text-[12px] sm:text-[16px] focus:outline-none border border-blackv1"
            />
            <button className="absolute top-1/2 sm:right-[80px] sm-custom:right-[60px] transform -translate-y-1/2 text-gray-400 hover:text-white">
              <FontAwesomeIcon icon={faImage} size="lg" />
            </button>

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
