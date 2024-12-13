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

// Endpoint to get user details by username
router.get('/user/:username', async (req, res) => {
  const { username } = req.params;

  try {
    // Find user by username
    const user = await User.findOne({ username: username });

    if (user) {
      res.json({
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

router.post('/user/new/add', async (req, res) => {
  const { username, firstname, lastname, loggedInUsername } = req.body;

  try {
    // 1. Find the logged-in user by their username
    const loggedInUser = await User.findOne({ username: loggedInUsername });
    
    if (!loggedInUser) {
      return res.status(404).send({ message: 'Logged-in user not found' });
    }

    // 2. Find the user being added (the user whose details were provided)
    const newUser = await User.findOne({ username });
    
    if (!newUser) {
      return res.status(404).send({ message: 'User not found' });
    }

    // 3. Add the new user's details to the logged-in user's private contacts
    const newContact = {
      username: newUser.username,
      firstname: newUser.firstname,
      lastname: newUser.lastname,
    };

    // Make sure the contact is not already in the contacts list (to avoid duplicates)
    if (!loggedInUser.contacts.private.some(contact => contact.username === username)) {
      loggedInUser.contacts.private.push(newContact);
    }

    // 4. Save the updated logged-in user
    await loggedInUser.save();

    res.status(200).send({ message: 'User added to contacts successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error adding user to contacts' });
  }
});

module.exports = router;
