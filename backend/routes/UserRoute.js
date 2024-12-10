const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Register API (Create New User)

router.post('/user/register', async (req, res) => {
  const { username, firstname, lastname, email, password } = req.body;
  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const newUser = new User({ username, firstname, lastname, email, password });
    await newUser.save();

    // Return a success response
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login API
router.post('/user/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Successful login
    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// API to Get Specific User Info based on Array of Usernames
router.post('/user/get-users', async (req, res) => {
  const { usernames } = req.body; // Array of usernames from the frontend
  console.log(usernames)

  try {
    // Check if 'usernames' is an array
    if (!Array.isArray(usernames)) {
      return res.status(400).json({ message: 'Usernames must be an array' });
    }

    // Query the database for the users with the given usernames
    const users = await User.find({ username: { $in: usernames } })
      .select('username firstname lastname'); // Only fetch the required fields

    // Check if any users are found
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found for the given usernames' });
    }

    // Respond with the user data
    res.status(200).json(users);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
