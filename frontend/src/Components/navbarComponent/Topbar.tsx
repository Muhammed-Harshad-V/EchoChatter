import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { Outlet } from 'react-router-dom';

const TopBar: React.FC = () => {
  // Logout function
  const handleLogout = () => {
    // Remove the username or any other user-related data from localStorage
    localStorage.removeItem('username'); // or any other key you're using

    // Reload the page to reflect the logout action
    window.location.reload();
  };

  return (
    <div className='w-full h-full flex flex-col bg-blacks1'>
      <div className="flex items-center justify-between px-8 py-4 bg-blacks1 shadow-md h-[60px]">
        {/* Left: App Name */}
        <div className="flex items-center">
          <p className="text-white text-xl ml-4 font-semibold">EchoChatter</p>
        </div>

        {/* Right: Profile & Logout */}
        <div className="flex items-center space-x-8">
          {/* Settings */}
          <button className="flex items-center text-gray-400 hover:text-white">
            <FontAwesomeIcon icon={faUser} size="lg" />
            <span className="ml-2 hidden sm:block">Profile</span>
          </button>

          {/* Logout */}
          <button 
            className="flex items-center text-gray-400 hover:text-white"
            onClick={handleLogout} // Bind the logout function to the button
          >
            <FontAwesomeIcon icon={faSignOutAlt} size="lg" />
            <span className="ml-2 hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
      <div className='xl:w-[90%] w-full m-auto'>
        <Outlet />
      </div>
    </div>
  );
};

export default TopBar;
