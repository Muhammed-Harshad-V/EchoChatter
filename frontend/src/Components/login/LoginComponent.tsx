import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const LoginComponent = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Handle form submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Username:", username);
    console.log("Password:", password);
    // Add logic to handle login API call here
  };

  return (
    <div className="flex items-center justify-center h-[calc(100vh-60px)] bg-black">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-[90%] max-w-md">
        <h1 className="text-2xl sm:text-lg sm-custom:text-lg font-bold text-white text-center mb-6">
          Login to H-Messenger
        </h1>
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
          >
            Login
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
