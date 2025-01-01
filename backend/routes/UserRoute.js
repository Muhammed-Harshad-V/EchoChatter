const express = require("express");
const User = require("../models/User");
const GroupChat = require("../models/GroupChat");
const router = express.Router();
const { getConnection } = require('../logic/messageService');

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
  const { username, loggedInUsername } = req.body;

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
      username: loggedInUser.username,
      firstname: loggedInUser.firstname,
      lastname: loggedInUser.lastname,
    };

    // Make sure the contact is not already in the contacts list (to avoid duplicates)
    if (!newUser.contacts.private.some(contact => contact.username === loggedInUser.username)) {
      newUser.contacts.private.push(newContact);
    }

    // 4. Save the updated logged-in user
    await newUser.save();

    res.status(200).send({ message: 'User added to contacts successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error adding user to contacts' });
  }
});

// POST API to create a new group
router.post('/user/new/group', async (req, res) => {
  try {
    // Destructure name and participants from the request body
    const { name, participants } = req.body;

    // Validate the required fields
    if (!name || !participants || participants.length < 2) { // At least two participants are needed (including the creator)
      return res.status(400).json({ message: "Group name and at least two participants are required." });
    }

    // Create a new group chat instance with the provided data
    const newGroup = new GroupChat({
      name,
      participants,
      messages: [],  // Initialize with an empty messages array
    });

    // Save the new group to the database
    await newGroup.save();

    // Prepare the message to send to each participant
    const messageToSend = { type: 'group-update', message: 'New group created!' };

    // Loop through each participant and update their contacts
    for (const participant of participants) {
      console.log('Updating user:', participant);

      // Fetch the participant's user document from the database
      const user = await User.findOne({ username: participant });

      if (user) {
        // Add the group to the participant's contacts.group array
        user.contacts.group.push({
          groupname: newGroup.name,
          participants: participants,  // Store all participants in the group
        });

        // Save the updated user data
        await user.save();

        // Send a WebSocket notification to the participant
        // Ensure you have a proper connections map where WebSocket clients are stored
        const participantClient = getConnection(participant);  // Assuming 'connections' is an object that holds WebSocket connections by username
            console.log(participantClient);
        if (participantClient && participantClient.ws && participantClient.ws.readyState === WebSocket.OPEN) {
          participantClient.ws.send(JSON.stringify(messageToSend));  // Send the notification to the participant
        }
      }
    }

    // Respond with the created group
    return res.status(201).json({
      message: 'Group created successfully!',
      group: newGroup,
    });
  } catch (error) {
    console.error('Error creating group:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});




module.exports = router;
