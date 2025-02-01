import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { Outlet } from 'react-router-dom';
import { useGlobalState } from '../../context/ContactsProvider';
import { useNavigate } from 'react-router-dom';
import { socketuri } from '../../api/api';

// Define WebSocket message structure
interface WebSocketMessage {
  type: string;
  message: string;
}

const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const wsRef = useRef<WebSocket | null>(null);
  const { fetchContacts } = useGlobalState(); // Make sure this is correctly typed in ContactsProvider

  useEffect(() => {
    const loggedInUsername = localStorage.getItem('username');  // Assuming you have the username
    if (loggedInUsername && !wsRef.current) { // Only create a new WebSocket if it doesn't exist already
      // Establish WebSocket connection
      wsRef.current = new WebSocket(`${socketuri}/${loggedInUsername}`);
      
      // WebSocket event handlers
      wsRef.current.onopen = () => {
        console.log(`Connected to WebSocket server as ${loggedInUsername}`);
      };

      wsRef.current.onmessage = (event: MessageEvent) => {
        let data: WebSocketMessage[] = [];

        try {
          data = JSON.parse(event.data);
        } catch (error) {
          console.error('Error parsing WebSocket data:', error);
          return;
        }
      
        // Ensure the data is an array, if not wrap it in an array
        if (!Array.isArray(data)) {
          data = [data];
        }
      
        console.log(data);
      
        // Check if the incoming data contains messages and/or notifications
        data.forEach((item) => {
          if (item.type === 'contact-update') {
            console.log('Notification:', item.message);
            fetchContacts(); // Ensure this is only called when necessary
          }
  
          if (item.type === 'new-group-chat') {
            console.log('New message notification:', item.message);
            fetchContacts(); // Ensure this is only called when necessary
          }
        });
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket connection closed");
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      // Send a message every 10 seconds to keep the connection alive
      const intervalId = setInterval(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const heartbeatMessage: WebSocketMessage = { type: "ping", message: "keep alive" };
          wsRef.current.send(JSON.stringify(heartbeatMessage)); // Send heartbeat message
          console.log("Sent heartbeat to server");
        }
      }, 10000); // 10 seconds

      // Clean up when the component is unmounted
      return () => {
        clearInterval(intervalId);  // Clear the interval when the component is unmounted
        if (wsRef.current) {
          wsRef.current.close();  // Close WebSocket connection when the component is unmounted
        }
      };
    }
  }, []); // Empty dependency array ensures it runs only once after the first render

  // Logout function
  const handleLogout = () => {
    // Remove the username or any other user-related data from localStorage
    localStorage.removeItem('username'); // or any other key you're using
    navigate('/login');
    window.location.reload();
  };

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* TopBar - Fixed */}
      <div className="flex items-center justify-between px-8 py-4 bg-blacks1 shadow-md h-[60px] fixed w-full top-0 z-50">
        <div className="flex items-center">
          <p className="text-white text-xl ml-4 font-semibold">EchoChatter</p>
        </div>
        
        <div className="flex items-center space-x-8">
          <button className="flex items-center text-gray-400 hover:text-white">
            <FontAwesomeIcon icon={faUser} size="lg" />
            <span className="ml-2 hidden sm:block">Profile</span>
          </button>

          <button 
            className="flex items-center text-gray-400 hover:text-white"
            onClick={handleLogout} // Bind the logout function to the button
          >
            <FontAwesomeIcon icon={faSignOutAlt} size="lg" />
            <span className="ml-2 hidden sm:block">Logout</span>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto mt-[60px] flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default TopBar;
