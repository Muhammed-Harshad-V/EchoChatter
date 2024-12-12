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

// API to Get Specific User Info or Group Info based on Array of Usernames/Group Names
router.post('/user/get-users', async (req, res) => {
  const { usernames, groupNames } = req.body; // Array of usernames and/or group names from the frontend
  console.log(usernames, groupNames);

  try {
    let responseData = [];

    // If usernames are provided, query users
    if (Array.isArray(usernames) && usernames.length > 0) {
      const users = await User.find({ username: { $in: usernames } })
        .select('username firstname lastname'); // Only fetch the required fields

      if (users.length > 0) {
        responseData = responseData.concat(
          users.map(user => ({
            type: 'private',  // Type for user data
            data: user
          }))
        );
      } else {
        return res.status(404).json({ message: 'No users found for the given usernames' });
      }
    }

    // If groupNames are provided, query groups
    if (Array.isArray(groupNames) && groupNames.length > 0) {
      const groups = await GroupChat.find({ name: { $in: groupNames } });

      if (groups.length > 0) {
        responseData = responseData.concat(
          groups.map(group => ({
            type: 'group',  // Type for group data
            data: {
              name: group.name,
              participants: group.participants
            }
          }))
        );
      } else {
        return res.status(404).json({ message: 'No groups found for the given group names' });
      }
    }

    // Respond with the data for both users and/or groups
    res.status(200).json(responseData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
