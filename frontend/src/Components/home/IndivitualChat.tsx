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
  const { chatId } = useParams<{ chatId: string }>();
  const self = localStorage.getItem("username");
  const { fetchContacts } = useGlobalState();
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const listRef = useRef<List | null>(null);

  const isGroupChat = chatId && chatId.includes("group");
  const chatIdentifier = isGroupChat ? chatId.split("-").slice(1).join("-") : chatId;

  useEffect(() => {
    setMessages([]);
    const socketConnection = new WebSocket(`${socketUrl}/${self}/${chatIdentifier}`);
    setSocket(socketConnection);

    socketConnection.onopen = () => {
      socketConnection.send(
        JSON.stringify({
          sender: self,
          recipient: chatIdentifier,
          text: `joined the chat`,
        })
      );
    };

    socketConnection.onmessage = (event: MessageEvent) => {
      let data = JSON.parse(event.data);
      data = Array.isArray(data) ? data : [data];

      data.forEach((item: { type: string; message?: string; messages?: Message[] }) => {
        if (Array.isArray(item.messages)) {
          const incomingMessages = item.messages.map((message: Message) => ({
            sender: message.sender,
            content: message.content,
            timestamp: message.timestamp,
          }));
          setMessages((prevMessages) => [...prevMessages, ...incomingMessages]);
        }
      });
    };

    socketConnection.onerror = (error) => {
      console.error("WebSocket Error: ", error);
    };

    return () => {
      socketConnection.close();
    };
  }, [chatIdentifier, fetchContacts, self]);

  const renderMessage = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const message = messages[index];
    const isSender = message.sender === self;

    const formattedTime = new Date(message.timestamp).toLocaleString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return (
      <div key={index} style={{ ...style, paddingBottom: "16px" }} className="flex items-start mb-6">
        <div className={`${isSender ? "ml-auto" : ""}`}>
          <div className={`flex flex-col max-w-xs ${isSender ? "items-end" : "items-start"}`}>
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

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(messages.length - 1); // Scroll to the last message
    }
  }, [messages]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSend = () => {
    const sender = self || "UnknownUser";
    if (message.trim() && socket) {
      const messageData = {
        type: isGroupChat ? "group" : "private",
        sender: sender,
        receiver: chatIdentifier,
        content: message,
      };

      socket.send(JSON.stringify(messageData));

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: sender, content: message, timestamp: Date.now() },
      ]);

      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const userData = {
    profilePicture: "https://via.placeholder.com/53",
    name: chatIdentifier,
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
          <h1 className="text-sm font-semibold text-white">{userData.name || chatIdentifier}</h1>
        </div>
      </div>

      <div className="flex flex-col lg:h-[calc(100svh-128px)] sm-custom:h-[calc(100vh-110px)] w-full bg-blackv1">
        <div className="flex-1 bg-blackv1 p-6 sm-custom:p-[10px] sm:p-[18px] flex flex-col justify-start items-start">
          <List
            ref={listRef}
            height={window.innerHeight - 90}
            itemCount={messages.length}
            itemSize={80}
            width="80%"
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
