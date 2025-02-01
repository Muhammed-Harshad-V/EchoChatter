import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { api } from "../../api/api";

const RegisterComponent = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null); // For handling errors
  const [loading, setLoading] = useState(false); // For handling loading state

  const navigate = useNavigate(); // For navigation after registration

  // Handle form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear any previous errors
    setLoading(true); // Start loading

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Make API call to register the user
      const response = await axios.post(`${api}/user/register`, {
        username,
        email,
        password,
      });

      if (response.status === 201) {
        // If registration is successful, store username in localStorage
        localStorage.setItem("username", username);

        // Redirect to profile creation page
        navigate("/create/Profile"); // Redirect to profile creation page
      }
    } catch (err: unknown) {
      // Handle error responses from the server
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError;
        if (axiosError.response && axiosError.response.data && (axiosError.response.data as { message: string }).message) {
          setError((axiosError.response.data as { message: string }).message); // Display server error message
        } else {
          setError("An unknown error occurred. Please try again later.");
        }
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="flex items-center justify-center h-[100vh] bg-black">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-[90%] max-w-md">
        <h1 className="text-2xl sm:text-lg sm-custom:text-lg font-bold text-white text-center mb-6">
          Create an Account
        </h1>

        {/* Display error message if any */}
        {error && (
          <div className="bg-red-500 text-white p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col space-y-4">
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

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-gray-400 sm:text-sm text-lg mb-2 sm-custom:text-sm"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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

          {/* Confirm Password Input */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-gray-400 sm:text-sm text-lg mb-2 sm-custom:text-sm"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg sm:text-sm text-base focus:outline-none border border-gray-700 sm-custom:text-sm"
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg sm:text-sm text-base hover:bg-blue-600 transition sm-custom:text-sm"
            disabled={loading} // Disable the button while loading
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 sm:text-xs text-sm sm-custom:text-[12px]">
            Already have an account?{" "}
            <NavLink
              to="/login"
              className="text-blue-400 hover:underline sm-custom:text-[12px]"
            >
              Login
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterComponent;
