import { useState } from 'react';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import { useGlobalState } from '../../../../context/ContactsProvider'; // Custom context for contacts

interface UserDetails {
  data: {
    username: string;
    firstname: string;
    lastname: string;
    email: string;
  };
}

const NewGroupChat = () => {
  const [groupName, setGroupName] = useState(''); // For storing group name input
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]); // For storing selected participants
  const [loading, setLoading] = useState(false); // For loading state
  const [error, setError] = useState<string | null>(null); // For error state

  const navigate = useNavigate(); // Hook for navigation

  // Fetch contacts from the context (global state)
  const { contacts } = useGlobalState(); // Assuming contacts are provided by the context

  // Retrieve the username of the group creator from localStorage
  const loggedInUsername = localStorage.getItem('username'); // Assuming username is stored in localStorage

  // If no username is found, set an error and prevent submission
  if (!loggedInUsername) {
    setError('User is not logged in');
  }

  // Handle group name input change
  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value);
  };

  // Handle participant selection change
  const handleParticipantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { options } = e.target;
    const selectedValues: string[] = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    setSelectedParticipants(selectedValues);
  };

  // Handle form submission to create the group chat
  const createGroupChat = async () => {
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }
    if (selectedParticipants.length < 1) {
      setError('Please select at least one participant');
      return;
    }
    if (!loggedInUsername) {
      setError('User is not logged in');
      return;
    }

    setLoading(true);
    setError(null); // Clear previous errors

    try {
      // Make an API request to create the group chat
      const response = await axios.post('http://localhost:3000/api/user/new/group', {
        name: groupName,
        participants: [loggedInUsername, ...selectedParticipants],
      });

      if (response.status === 201) {
        navigate(`/group/${response.data.group._id}`); // Navigate to the newly created group chat
      } else {
        setError('Error creating group');
      }
    } catch (err) {
      setError('Error creating group');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle removal of a participant from the selected list
  const removeParticipant = (username: string) => {
    setSelectedParticipants((prev) =>
      prev.filter((participant) => participant !== username)
    );
  };

  return (
    <div className="w-full h-[calc(100vh-60px)] p-4">
      <div className="flex flex-col items-center p-4 bg-black text-white w-full max-w-sm mx-auto rounded-lg mt-[80px]">
        <h2 className="text-2xl font-bold mb-4">Create New Group Chat</h2>

        {/* Group Name Input */}
        <div className="relative mb-4 w-full">
          <input
            type="text"
            value={groupName}
            onChange={handleGroupNameChange}
            placeholder="Enter Group Name"
            className="w-full p-3 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="text-white mb-4">
            <p>Loading...</p>
          </div>
        )}

        {/* Participants Selection Section */}
        <div className="w-full mb-4">
          <h3 className="text-lg font-semibold mb-2">Select Participants</h3>

          {/* Available Participants Dropdown */}
          <div className="mb-4">
            <select
              multiple
              value={selectedParticipants}
              onChange={handleParticipantChange}
              className="w-full p-3 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {contacts.map((contact: UserDetails) => (
                <option key={contact.data.username} value={contact.data.username}>
                  {contact.data.firstname} {contact.data.lastname}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Participants */}
          {selectedParticipants.length > 0 && (
            <div className="w-full bg-gray-800 p-3 rounded-md mt-4">
              <h4 className="text-sm text-gray-400 mb-2">Selected Participants</h4>
              <ul className="space-y-2">
                {selectedParticipants.map((username) => {
                  const contact = contacts.find(
                    (contact: UserDetails) => contact.data.username === username
                  );
                  return contact ? (
                    <li key={username} className="flex justify-between items-center">
                      <span className="text-white">
                        {contact.data.firstname} {contact.data.lastname}
                      </span>
                      <button
                        onClick={() => removeParticipant(username)}
                        className="text-red-500 text-sm hover:text-red-700"
                      >
                        Remove
                      </button>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={createGroupChat}
          className="w-full bg-blue-600 p-3 rounded-md text-white font-bold hover:bg-blue-700"
        >
          Create Group Chat
        </button>

        {/* Navigation Back */}
        <NavLink to={"/"} className="mt-4 text-sm text-blue-500 hover:text-blue-700">
          Back
        </NavLink>
      </div>
    </div>
  );
};

export default NewGroupChat;
