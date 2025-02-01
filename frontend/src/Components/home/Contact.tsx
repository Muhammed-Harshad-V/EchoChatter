import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { faComments, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGlobalState } from '../../context/ContactsProvider';

// interface ContactData {
//   type: 'private' | 'group'; // Type of contact: private (user) or group
//   data: {
//     username?: string;   // For private contact
//     firstname?: string;  // For private contact
//     lastname?: string;   // For private contact
//     name?: string;       // For group contact
//     participants?: string[]; // For group contact
//   };
// }

const Contact = () => {
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false); // Controls full drawer open/close
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768); // Tracks if screen width is <768px
  const { contacts, loading, fetchContacts } = useGlobalState();
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const navigate = useNavigate(); // Used for programmatic navigation

  // Fetch contacts from API
  useEffect(() => {
    fetchContacts(); // Call the function to fetch contacts
  }, []); // Run only once on component mount

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

  // Open the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const defaultPhotoUrl = 'https://www.w3schools.com/w3images/avatar2.png'; // Default profile photo

  // Navigate to create a private chat
  const navigateToPrivateChat = () => {
    navigate('/add/private'); // Navigate to the private chat creation page
    closeModal();
  };

  // Navigate to create a new group
  const navigateToNewGroup = () => {
    navigate('/create/group'); // Navigate to the group creation page
    closeModal();
  };

  // Handle click outside the modal
  useEffect(() => {
    const handleClickOutsideModal = (event: MouseEvent) => {
      const modal = document.getElementById('modal');
      if (modal && !modal.contains(event.target as Node)) {
        closeModal(); // Close modal if click is outside the modal
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutsideModal);
    } else {
      document.removeEventListener('mousedown', handleClickOutsideModal);
    }

    return () => document.removeEventListener('mousedown', handleClickOutsideModal);
  }, [isModalOpen]);

  return (
    <div
      id="drawer"
      className={`bg-black flex-col flex ${isSmallScreen ? (isDrawerExpanded ? 'w-[200px] absolute z-40 h-[calc(100vh-60px)]' : 'w-[70px]') : 'w-[320px]'}`}
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

        {/* Plus Icon in Header */}
        <FontAwesomeIcon
          icon={faPlus}
          className={`text-white cursor-pointer ml-auto ${isSmallScreen && !isDrawerExpanded ? 'hidden' : 'block'}`}
          style={{ fontSize: '16px' }}
          onClick={openModal} // Open modal on click
        />
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blackv1 scrollbar-track-transparent">
        {loading ? (
          <div className="text-white text-center p-4">Loading contacts...</div>
        ) : (
          <div className="space-y-2 p-1">
            {contacts.map((contact, index) => (
              <NavLink
                key={index}
                to={contact.type === 'private' ? `/contact/${contact.data.username}` : `/contact/group-${contact.data.name}`}
                className={({ isActive }) =>
                  `block p-3 rounded-lg text-gray-300 ${isActive ? 'bg-blackv1' : ''}` // Apply active styles
                }
              >
                <div className="flex items-center space-x-4">
                  <div className="relative w-10 h-10 rounded-full">
                    <img
                      src={defaultPhotoUrl} // Use default if no photo src={contact.data.avatar || defaultPhotoUrl} 
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

      {/* Modal for Adding New Contact or Group */}
      {isModalOpen && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-40">
          <div
            id="modal"
            className="bg-slate-950 p-6 rounded-lg shadow-2xl w-[300px]"
            onClick={(e) => e.stopPropagation()} // Prevent click propagation when clicking inside modal
          >
            <h3 className="font-bold text-lg mb-4 text-white">Select an Action</h3>
            <button
              onClick={navigateToPrivateChat}
              className="w-full p-2 mb-2 bg-blue-500 text-white rounded-md"
            >
              Start New Private Chat
            </button>
            <button
              onClick={navigateToNewGroup}
              className="w-full p-2 mb-2 bg-green-500 text-white rounded-md"
            >
              Create New Group
            </button>
            <button
              onClick={closeModal}
              className="w-full p-2 bg-black text-white rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
