const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  
  // Validate input
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      username, 
      password: hashedPassword, 
      role: role || 'user' 
    });
    
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  console.log('\n=== Login Attempt ===');
  console.log('Time:', new Date().toISOString());
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  
  const { username, password } = req.body;
  
  // Validate input
  if (!username || !password) {
    console.log('Validation failed: Missing username or password');
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    console.log('Looking up user:', username);
    const user = await User.findOne({ username });
    
    if (!user) {
      console.log('User not found:', username);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Verifying password for user:', username);
    const match = await bcrypt.compare(password, user.password);
    
    if (!match) {
      console.log('Invalid credentials for user:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Generating token for user:', username);
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    console.log('Login successful for user:', username);
    res.json({ token, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

module.exports = router;
