import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';

interface Contact {
  type: 'private' | 'group';  // Type of contact: private (user) or group
  data: {
    username?: string;   // For private contact
    firstname?: string;  // For private contact
    lastname?: string;   // For private contact
    name?: string;       // For group contact
    participants?: string[]; // For group contact
  };
}

const Contact = () => {
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false); // Controls full drawer open/close
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768); // Tracks if screen width is <768px
  const [contacts, setContacts] = useState<Contact[]>([]); // State to store the contact list data
  const [loading, setLoading] = useState(true); // State to handle loading status

  // Fetch contacts from API
  useEffect(() => {
    const fetchContacts = async () => {
      const usernames = ["katie_brown", 'jane_smith', 'michael_jordan', "alex_williams", "chris_evans", "susan_lee", "tom_hanks", 
        "emma_watson", "robert_downey"]; // Replace with actual usernames you want to fetch
      const groupNames = ['Tech_Enthusiasts'];

      try {
        // Send a POST request with the array of usernames and group names
        const response = await axios.post('http://localhost:3000/api/user/get-users', { usernames, groupNames });
        
        // Update state with fetched data
        setContacts(response.data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      } finally {
        setLoading(false); // Set loading to false once the data is fetched
      }
    };

    fetchContacts(); // Call the function to fetch contacts
  }, []);

  // Handle screen resizing to determine small screen behavior
  useEffect(() => {
    const handleResize = () => {
      const isCurrentlySmallScreen = window.innerWidth < 768;
      setIsSmallScreen(isCurrentlySmallScreen);

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
    const handleClickOutside = (event) => {
      const drawer = document.getElementById('drawer');
      const toggleButton = document.getElementById('toggle-drawer-button');
      if (
        isDrawerExpanded &&
        drawer &&
        !drawer.contains(event.target) &&
        toggleButton !== event.target
      ) {
        setIsDrawerExpanded(false); // Close the drawer
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDrawerExpanded]);

  const defaultPhotoUrl =
    'https://www.w3schools.com/w3images/avatar2.png'; // Default profile photo

  return (
    <div
      id="drawer"
      className={`bg-black flex-col flex ${isSmallScreen ? (isDrawerExpanded ? 'w-[200px] absolute z-50 h-[calc(100vh-60px)]' : 'w-[70px]') : 'w-[320px]'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between lg:p-4 sm:p-2 sm-custom:p-2 z-10">
        <div className="flex flex-row items-center justify-center">
          <button onClick={() => setIsDrawerExpanded(!isDrawerExpanded)}>
            <FontAwesomeIcon icon={faComments} style={{ color: '#c9c9c9' }} size="2x" />
          </button>
          <p className={`text-white text-xl ml-3 ${isSmallScreen && !isDrawerExpanded ? 'hidden' : 'block'}`}>
            Chat
          </p>
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blackv1 scrollbar-track-transparent">
        {loading ? (
          <div className="text-white text-center p-4">Loading contacts...</div>
        ) : (
          <div className="space-y-2">
            {contacts.map((contact, index) => (
              <NavLink
                key={index}
                to={contact.type === 'private' ? `/contact/${contact.data.username}` : `/contact/group-${contact.data.name}`}
                className={({ isActive }) =>
                  `block p-3 rounded-2xl text-gray-300 ${isActive ? 'bg-blackv1' : ''}` // Apply active styles
                }
              >
                <div className="flex items-center space-x-4">
                  <div className="relative w-10 h-10 rounded-full">
                    <img
                      src={defaultPhotoUrl} // Use default if no photo src={contact. || defaultPhotoUrl} 
                      alt={contact.type === 'private' ? contact.data.firstname : contact.data.name}
                      className="object-cover w-full h-full rounded-full"
                    />
                    <div
                      className={`absolute bottom-0 right-0 w-[14px] h-[14px] rounded-full ${contact.type === 'private' ? (contact.data.username ? 'bg-green-500' : 'bg-gray-500') : 'bg-blue-500'}`}
                    ></div>
                  </div>
                  <span className={`${isSmallScreen && !isDrawerExpanded ? 'hidden' : 'block'}`}>
                    {contact.type === 'private' ? `${contact.data.firstname} ${contact.data.lastname}` : contact.data.name}
                  </span>
                </div>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Contact;
