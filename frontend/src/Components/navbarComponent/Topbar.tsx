import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { Outlet } from 'react-router-dom';

const TopBar: React.FC = () => {
  return (
    
    <div className='max-w-full bg-blacks1 h-screen flex flex-col overflow-hidden'>
      <div className="flex items-center justify-between px-8 py-4 bg-blacks1 shadow-md">
        {/* Left: App Name */}
        <div className="flex items-center">
          <p className="text-white text-xl ml-4 font-semibold">H-Messenger</p>
        </div>
  
        {/* Right: Profile & Logout */}
        <div className="flex items-center space-x-8">
          {/* Settings */}
          <button className="flex items-center text-gray-400 hover:text-white">
            <FontAwesomeIcon icon={faCog} size="lg" />
            <span className="ml-2 hidden sm:block">Settings</span>
          </button>
  
          {/* Logout */}
          <button className="flex items-center text-gray-400 hover:text-white">
            <FontAwesomeIcon icon={faSignOutAlt} size="lg" />
            <span className="ml-2 hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
      <div className='w-[90%] m-auto mt-2'>
        <Outlet />
      </div>
    </div>
  );
};

export default TopBar;
