import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { faComments, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';

interface Contact {
  type: 'private' | 'group'; // Type of contact: private (user) or group
  data: {
    username?: string;   // For private contact
    firstname?: string;  // For private contact
    lastname?: string;   // For private contact
    name?: string;       // For group contact
    participants?: string[]; // For group contact
  };
}

interface privateData {
  username?: string;   // For private contact
  firstname?: string;  // For private contact
  lastname?: string;
}

interface group {
  groupname?: string;
  participants?: string[];
}

const Contact = () => {
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false); // Controls full drawer open/close
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768); // Tracks if screen width is <768px
  const [contacts, setContacts] = useState<Contact[]>([]); // State to store the contact list data
  const [loading, setLoading] = useState(true); // State to handle loading status
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [newContactData, setNewContactData] = useState({ name: '', username: '', participants: '' }); // For form data
  console.log(isModalOpen); // Debugging statement

  // Fetch contacts from API
  useEffect(() => {
    const fetchContacts = async () => {
      const Username = localStorage.getItem('username'); // Get username from localStorage

      if (!Username) {
        console.error('Username not found in localStorage');
        return;
      }

      try {
        // Make an API request to get the contacts based on the username
        const response = await axios.get(`http://localhost:3000/api/user/contacts/${Username}`);
        
        const { privateContacts, groupContacts } = response.data;

        // Format the contacts into the appropriate structure
        const formattedContacts: Contact[] = [
          ...privateContacts.map((contact: privateData) => ({
            type: 'private',
            data: {
              username: contact.username,
              firstname: contact.firstname,
              lastname: contact.lastname,
            }
          })),
          ...groupContacts.map((group: group) => ({
            type: 'group',
            data: {
              name: group.groupname,
              participants: group.participants,
            }
          })),
        ];

        // Set the state with the formatted contacts
        setContacts(formattedContacts);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      } finally {
        setLoading(false); // Set loading to false once the data is fetched
      }
    };

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

  // Open the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewContactData(prevState => ({ ...prevState, [name]: value }));
  };

  // Handle form submission (add new contact or group)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newContactData.name || !newContactData.username) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      // Add logic for adding a new contact or group to the backend here.
      // Example for private contact:
      await axios.post('http://localhost:3000/api/user/contacts', newContactData);

      // Close the modal after submission
      closeModal();

      // Optionally, refresh the contacts list after adding a new contact
      // fetchContacts(); // Uncomment to refresh the contacts list
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

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

        {/* Plus Icon in Header */}
        <FontAwesomeIcon
          icon={faPlus}
          className={`text-white cursor-pointer ml-auto ${isSmallScreen && !isDrawerExpanded ? 'hidden' : 'block'}`}
          style={{ fontSize: '16px' }}
          onClick={openModal} // Open the modal
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

      {/* Modal for Adding New Contact or Group */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-[300px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">Add New Contact or Group</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Group or Contact Name"
                  value={newContactData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  name="username"
                  placeholder="Username (for private contacts)"
                  value={newContactData.username}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <textarea
                  name="participants"
                  placeholder="Participants (for groups, comma separated)"
                  value={newContactData.participants}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 rounded-md mr-2"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
