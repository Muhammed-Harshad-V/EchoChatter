const express = require("express");
const User = require("../models/User");
const GroupChat = require("../models/GroupChat");
const router = express.Router();

// Register API (Create New User)

router.post('/user/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const newUser = new User({ username, email, password });
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
  const { username, password } = req.body;
  console.log(username)
  try {
    // Check if user exists
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
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
// Endpoint to find user by username and add firstname/lastname
router.put('/user/:username', async (req, res) => {
  const { username } = req.params;
  const { firstname, lastname } = req.body;

  if (!firstname || !lastname) {
    return res.status(400).json({ message: 'Firstname and lastname are required' });
  }

  try {
    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user with firstname and lastname
    user.firstname = firstname;
    user.lastname = lastname;

    // Save updated user
    await user.save();

    return res.status(200).json({ message: 'User updated successfully', user });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/user/contacts/:username', async (req, res) => {
  const { username } = req.params;

  try {
    // Find user by username
    const user = await User.findOne({ username });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Extract contacts object
    const { contacts } = user;

    // Check if the contacts object has private and group arrays
    if (!contacts || !Array.isArray(contacts.private) || !Array.isArray(contacts.group)) {
      return res.status(400).json({ message: 'no contacts found' });
    }

    // Return the private and group arrays
    return res.status(200).json({
      privateContacts: contacts.private,
      groupContacts: contacts.group,
    });

  } catch (err) {
    console.error("Error fetching user data:", err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
