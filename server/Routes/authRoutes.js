const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 📝 1. SIGNUP ROUTE
router.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ message: "User already exists" });

        // Hash the password (Security step)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create and save user
        user = new User({ username, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error during signup" });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        
        const token = jwt.sign({ userId: user._id }, 'secretKey', { expiresIn: '1h' });

        res.json({ token, userId: user._id });
    } catch (err) {
        res.status(500).json({ message: "Server error during login" });
    }
});

module.exports = router;