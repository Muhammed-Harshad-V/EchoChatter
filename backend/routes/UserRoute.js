const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Register route to handle user registration
router.post('/user/register', async (req, res) => {
    const { username, password, email } = req.body;
  
    // Basic validation (you can add more validation here)
    if (!username || !password || !email) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
  
    try {
      // Check if the username or email already exists
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        return res.status(400).json({ message: 'Username or email already exists.' });
      }
  
      // Create new user with hashed password
      const newUser = new User({ username, password, email });
      await newUser.save();
  
      // Return the username to the frontend after successful registration
      res.status(201).json({ username: newUser.username });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


// Login route to handle user login
router.post('/user/login', async (req, res) => {
    const { username, password } = req.body;
  
    // Basic validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
  
    try {
      // Find the user by username
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: 'Invalid username or password.' });
      }
  
      // Compare the provided password with the stored hashed password
      const isMatch = await user.matchPassword(password);  // Use the method to compare passwords
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid username or password.' });
      }
  
      // Successful login
      res.status(200).json({ message: 'Login successful', username: user.username });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

module.exports = router;
