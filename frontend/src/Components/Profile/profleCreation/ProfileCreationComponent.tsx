import React, { useState, useRef } from "react";
import axios from "axios"; // Make sure you have axios installed
import { useNavigate } from "react-router-dom"; // For redirecting after successful update

const ProfileCreationPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null); // For future use if needed
  const [error, setError] = useState<string | null>(null); // For error messages
  const navigate = useNavigate(); // For navigation after successful profile update

  // Reference to the file input for triggering click on the profile image
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle profile picture selection (for later)
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click when the profile image is clicked (for later)
  const handleProfilePicClick = () => {
    fileInputRef.current?.click();
  };

  // Handle form submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear any previous errors

    // Retrieve the username from localStorage
    const username = localStorage.getItem("username");

    if (!username) {
      setError("User not found. Please log in again.");
      return;
    }

    // Prepare the data to send to the API
    const data = {
      firstname: firstName,
      lastname: lastName,
    };

    try {
      // Call the API to update user details (you can replace this with your actual API endpoint)
      const response = await axios.put(`http://localhost:3000/api/user/${username}`, data);

      // Check if the response is successful
      if (response.status === 200) {
        navigate("/home"); // Redirect after successful update
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center h-[100vh] bg-black">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-[90%] max-w-md">
        <h1 className="text-2xl sm:text-lg sm-custom:text-lg font-bold text-white text-center mb-6">
          Complete Your Profile
        </h1>

        {/* Error Message Section */}
        {error && (
          <div className="bg-red-500 text-white p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="flex flex-col space-y-4">
          {/* Profile Picture Section */}
          <div className="flex justify-center mb-6">
            <div
              onClick={handleProfilePicClick}
              className="relative w-32 h-32 rounded-full border-4 border-blue-500 cursor-pointer overflow-hidden bg-gray-700"
            >
              {/* Show default profile image or user-uploaded image */}
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                  <span className="text-3xl">+ </span>
                </div>
              )}
              {/* Hidden file input to allow file selection */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* First Name Input */}
          <div>
            <label
              htmlFor="firstName"
              className="block text-gray-400 sm:text-sm text-lg mb-2 sm-custom:text-sm"
            >
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg sm:text-sm text-base focus:outline-none border border-gray-700 sm-custom:text-sm"
            />
          </div>

          {/* Last Name Input */}
          <div>
            <label
              htmlFor="lastName"
              className="block text-gray-400 sm:text-sm text-lg mb-2 sm-custom:text-sm"
            >
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg sm:text-sm text-base focus:outline-none border border-gray-700 sm-custom:text-sm"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg sm:text-sm text-base hover:bg-blue-600 transition sm-custom:text-sm"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileCreationPage;
