const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/users'); // Adjust the path to your User model
require('dotenv').config(); // Load environment variables

// Register a new user
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const user = new User({ username, password, role });
        await user.save();

        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        console.error('Error registering user:', error.message);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

// Render the login page
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' }); // Adjusted to match the directory
});

// Handle login POST request
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.render('login', { title: 'Login', error: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.render('login', { title: 'Login', error: 'Invalid username or password' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Set the token as a cookie
        res.cookie('authToken', token, { httpOnly: true });

        // Redirect based on user role
        switch (user.role) {
            case 'Admin':
                res.redirect('/admin/home');
                break;
            case 'Manager':
                res.redirect('/manager/home');
                break;
            case 'Engineer':
                res.redirect('/engineer/home');
                break;
            default:
                res.redirect('/'); // Redirect to a default page if no role matches
        }
    } catch (error) {
        console.error('Login error:', error.message);
        res.render('login', { title: 'Login', error: 'Login failed' });
    }
});

// Logout user
router.get('/logout', (req, res) => {
    res.clearCookie('authToken');
    res.redirect('/users/login'); // Redirect to login page
});



module.exports = router;
