import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Contact = () => {
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false); // Controls full drawer open/close
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768); // Tracks if screen width is <768px

  // Handle screen resizing to determine small screen behavior
  useEffect(() => {
    const handleResize = () => {
      const isCurrentlySmallScreen = window.innerWidth < 768;

      setIsSmallScreen(isCurrentlySmallScreen);

      // If resizing to a large screen, ensure the drawer is fully expanded
      if (!isCurrentlySmallScreen) {
        setIsDrawerExpanded(true); // Expand drawer on larger screens
      } else {
        setIsDrawerExpanded(false); // Collapse drawer on smaller screens
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize); // Listen for screen resize

    return () => window.removeEventListener('resize', handleResize); // Cleanup
  }, []);

  // Close the drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const drawer = document.getElementById('drawer');
      const toggleButton = document.getElementById('toggle-drawer-button');
      if (
        isDrawerExpanded &&
        drawer &&
        !drawer.contains(event.target as Node) &&
        toggleButton !== event.target
      ) {
        setIsDrawerExpanded(false); // Close the drawer
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDrawerExpanded]);


  const contacts = [
    { id: 1, name: 'John Doe', isOnline: true, photoUrl: '' },
    { id: 2, name: 'Jane Smith', isOnline: false, photoUrl: '' },
    { id: 3, name: 'Mark Taylor', isOnline: true, photoUrl: '' },
    { id: 4, name: 'Sara Connor', isOnline: false, photoUrl: '' },
    { id: 1, name: 'John Doe', isOnline: true, photoUrl: '' },
    { id: 2, name: 'Jane Smith', isOnline: false, photoUrl: '' },
    { id: 3, name: 'Mark Taylor', isOnline: true, photoUrl: '' },
    { id: 4, name: 'Sara Connor', isOnline: false, photoUrl: '' },
    { id: 1, name: 'John Doe', isOnline: true, photoUrl: '' },
    { id: 2, name: 'Jane Smith', isOnline: false, photoUrl: '' },
    { id: 3, name: 'Mark Taylor', isOnline: true, photoUrl: '' },
    { id: 4, name: 'Sara Connor', isOnline: false, photoUrl: '' },
    { id: 1, name: 'John Doe', isOnline: true, photoUrl: '' },
    { id: 2, name: 'Jane Smith', isOnline: false, photoUrl: '' },
    { id: 3, name: 'Mark Taylor', isOnline: true, photoUrl: '' },
    { id: 4, name: 'Sara Connor', isOnline: false, photoUrl: '' },
    { id: 1, name: 'John Doe', isOnline: true, photoUrl: '' },
    { id: 2, name: 'Jane Smith', isOnline: false, photoUrl: '' },
    { id: 3, name: 'Mark Taylor', isOnline: true, photoUrl: '' },
    { id: 4, name: 'Sara Connor', isOnline: false, photoUrl: '' },
    { id: 1, name: 'John Doe', isOnline: true, photoUrl: '' },
    { id: 2, name: 'Jane Smith', isOnline: false, photoUrl: '' },
    { id: 3, name: 'Mark Taylor', isOnline: true, photoUrl: '' },
    { id: 4, name: 'Sara Connor', isOnline: false, photoUrl: '' },
    { id: 1, name: 'John Doe', isOnline: true, photoUrl: '' },
    { id: 2, name: 'Jane Smith', isOnline: false, photoUrl: '' },
    { id: 3, name: 'Mark Taylor', isOnline: true, photoUrl: '' },
    { id: 4, name: 'Sara Connor', isOnline: false, photoUrl: '' },
    { id: 1, name: 'John Doe', isOnline: true, photoUrl: '' },
    { id: 2, name: 'Jane Smith', isOnline: false, photoUrl: '' },
    { id: 3, name: 'Mark Taylor', isOnline: true, photoUrl: '' },
    { id: 4, name: 'Sara Connor ll', isOnline: false, photoUrl: '' },
  ];

  const defaultPhotoUrl =
    'https://www.w3schools.com/w3images/avatar2.png'; // Default profile photo

  return (
      <div
        id="drawer"
        className={`bg-black flex-col flex ${
          isSmallScreen
            ? isDrawerExpanded
              ? 'w-[200px] absolute z-50 h-[calc(100vh-60px)]' // Full width for small screens when expanded
              : 'w-[70px]' // Collapsed width for small screens
            : 'w-[320px]' // Full width for larger screens
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between lg:p-4 sm:p-2 sm-custom:p-2 z-10">
          <div className=' flex flex-row items-center justify-center'>
          <button onClick={() => setIsDrawerExpanded(!isDrawerExpanded)}>
          <FontAwesomeIcon icon={faComments} style={{ color: '#c9c9c9' }} size="2x" />
          </button>
          <p className={`${isSmallScreen && !isDrawerExpanded ? 'hidden' : 'block'} text-white text-xl ml-3`}> Chat </p>
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blackv1 scrollbar-track-transparent">
          <div className="space-y-2">
            {contacts.map((contact) => (
              <NavLink
                key={contact.id}
                to={`/contact/${contact.id}`} // Add the appropriate route
                className={({ isActive }) =>
                  `block p-3 rounded-2xl text-gray-300 ${
                    isActive ? 'bg-blackv1' : '' // Apply active styles
                  }`
                }
              >
                <div className="flex items-center space-x-4">
                  <div className="relative w-10 h-10 rounded-full">
                    <img
                      src={contact.photoUrl || defaultPhotoUrl} // Use default if no photo
                      alt={contact.name}
                      className="object-cover w-full h-full rounded-full"
                    />
                    <div
                      className={`absolute bottom-0 right-0 w-[14px] h-[14px] rounded-full ${
                        contact.isOnline ? 'bg-green-500' : 'bg-gray-500'
                      }`}
                    ></div>
                  </div>
                    <span
                        className={`${
                          isSmallScreen && !isDrawerExpanded
                            ? 'hidden'
                            : 'block'
                        }`}
                      >
                        {contact.name}
                    </span>
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
  );
};

export default Contact;
