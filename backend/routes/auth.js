const express = require('express');
const router = express.Router();

// Mock User Database
const users = [];

router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    const userExists = users.find(u => u.email === email);
    if (userExists) {
        return res.status(400).json({ error: 'User already exists.' });
    }
    const newUser = { id: Date.now().toString(), name, email, password };
    users.push(newUser);
    res.status(201).json({ message: 'User registered successfully', user: { id: newUser.id, name, email } });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
    }
    // Mock token
    const token = Buffer.from(user.id + user.email).toString('base64');
    res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email } });
});

module.exports = router;
