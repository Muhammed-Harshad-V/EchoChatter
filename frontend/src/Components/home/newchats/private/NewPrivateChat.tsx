import { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { NavLink, useNavigate } from 'react-router-dom';

interface UserDetails {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
}

const NewPrivateChat = () => {
  const [username, setUsername] = useState(''); // For storing username input
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null); // For storing user details
  const [loading, setLoading] = useState(false); // For loading state
  const [error, setError] = useState<string | null>(null); // For error state

  const navigate = useNavigate(); // Hook for navigation
  const defaultPhotoUrl = 'https://www.w3schools.com/w3images/avatar2.png'; // Default profile photo

  // Handle change in the username input field
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };
  
  // Handle form submission and check username existence
  const checkUsername = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError(null); // Clear previous errors
    setUserDetails(null); // Clear previous user details

    try {
      // Make an API request to check the username
      const response = await axios.get(`http://localhost:3000/api/user/${username}`);
      
      if (response.data) {
        setUserDetails(response.data); // Set the user details from the response
      } else {
        setError('Username does not exist');
      }
    } catch (err) {
      setError('Error checking username');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press to trigger username check
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      checkUsername();
    }
  };

  // New function to handle button click and send data to the backend
  const handleUserDetailsSubmit = async () => {
    if (!userDetails) return; // If no user details are present, do nothing

    const { username: userDetailsUsername, firstname, lastname } = userDetails;
    
    // Get the logged-in user's username from localStorage
    const loggedInUsername = localStorage.getItem('username'); // assuming username is saved in localStorage
    
    // If no username is found in localStorage, set an error
    if (!loggedInUsername) {
      setError('User is not logged in');
      return;
    }

    try {
      // Send user data to the backend along with the logged-in username
      const response = await axios.post('http://localhost:3000/api/user/new/add', {
        username: userDetailsUsername, // the username from the search
        firstname,
        lastname,
        loggedInUsername, // send the username from localStorage
      });

      // Navigate to the home page after successful submission
      if (response.status === 200) {
        navigate(`/contact/${userDetailsUsername}`); // Navigate to home page
      } else {
        setError('Error adding user');
      }
    } catch (err) {
      setError('Error sending data');
      console.error('Error:', err);
    }
  };

  return (
    <div className='w-full h-[calc(100vh-60px)] p-4'>
        <div className="flex flex-col items-center p-4 bg-black text-white w-full max-w-sm mx-auto rounded-lg mt-[80px]">
          <h2 className="text-2xl font-bold mb-4">Create New Private Chat</h2>
    
          {/* Username Input */}
          <div className="relative mb-4 w-full">
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              onKeyDown={handleKeyDown}  // Add keydown event to handle Enter key
              placeholder="Enter Username"
              className="w-full p-3 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={checkUsername}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white"
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>
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
    
          {/* User Details Display */}
          {userDetails && !loading && !error && (
            <button 
              className='w-full'
              onClick={handleUserDetailsSubmit}  // Handle the click event to send user data
            >
              <div className="bg-gray-800 p-4 w-full rounded-xl flex mb-4">
                <img src={defaultPhotoUrl} alt="UserProfile" className='w-10 h-10 rounded mr-4' />
                <p><strong>{userDetails.username}</strong></p>
              </div>
            </button>
          )}
          
          {/* Navigation Back */}
          <NavLink to={"/"}>
              Back
          </NavLink>
        </div>
    </div>
  );
};

export default NewPrivateChat;
