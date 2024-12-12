import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

const LoginComponent = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null); // State for error message
  const [loading, setLoading] = useState(false); // To handle loading state

  const navigate = useNavigate(); // Used to navigate after successful login

  // Handle form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear any previous errors
    setLoading(true); // Start loading

    try {
      // Make API call to login endpoint
      const response = await axios.post('http://localhost:3000/api/user/login', { username: username, password });
      
      // Check if login is successful
      if (response.status === 200) {
        localStorage.setItem("username", username);
        navigate('/'); // Assuming you have a dashboard route
      }
    } catch (err: any) { 
      // Handle errors
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message); // Set error message from response
      } else {
        setError("Server error. Please try again later.");
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };


  return (
    <div className="flex items-center justify-center h-[100vh] bg-black">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-[90%] max-w-md">
        <h1 className="text-2xl sm:text-lg sm-custom:text-lg font-bold text-white text-center mb-6">
          Login to H-Messenger
        </h1>
        
        {/* Display error message if any */}
        {error && (
          <div className="bg-red-500 text-white p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col space-y-4">
          {/* Username Input */}
          <div>
            <label
              htmlFor="username"
              className="block text-gray-400 sm:text-sm text-lg mb-2 sm-custom:text-sm"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg sm:text-sm text-base focus:outline-none border border-gray-700 sm-custom:text-sm"
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-gray-400 sm:text-sm text-lg mb-2 sm-custom:text-sm"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg sm:text-sm text-base focus:outline-none border border-gray-700 sm-custom:text-sm"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg sm:text-sm text-base hover:bg-blue-600 transition sm-custom:text-sm"
            disabled={loading} // Disable button when loading
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 sm:text-xs text-sm sm-custom:text-[12px]">
            Don’t have an account?{" "}
            <NavLink
              to="/signup"
              className="text-blue-400 hover:underline sm-custom:text-[12px]"
            >
              Sign up
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
