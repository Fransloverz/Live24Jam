const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// JWT Secret - In production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'live24jam-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Users data file
const USERS_FILE = path.join(__dirname, '../data/users.json');

// Ensure data directory exists
const dataDir = path.dirname(USERS_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Helper: Read users
function getUsers() {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            // Create default admin user
            const defaultUsers = [{
                id: 1,
                username: 'admin',
                password: bcrypt.hashSync('admin123', 10),
                email: 'admin@live24jam.com',
                role: 'admin',
                createdAt: new Date().toISOString()
            }];
            fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
            return defaultUsers;
        }
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch (error) {
        console.error('Error reading users:', error);
        return [];
    }
}

// Helper: Save users
function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

/**
 * POST /api/auth/login - Login user
 */
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username dan password diperlukan' });
    }

    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(401).json({ error: 'Username tidak ditemukan' });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
        return res.status(401).json({ error: 'Password salah' });
    }

    // Generate JWT token
    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
        success: true,
        message: 'Login berhasil',
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    });
});

/**
 * POST /api/auth/register - Register new user
 */
router.post('/register', (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Semua field diperlukan' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password minimal 6 karakter' });
    }

    const users = getUsers();

    // Check if username exists
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: 'Username sudah digunakan' });
    }

    // Check if email exists
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'Email sudah digunakan' });
    }

    // Create new user
    const newUser = {
        id: Date.now(),
        username,
        password: bcrypt.hashSync(password, 10),
        email,
        role: 'user',
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    // Generate JWT token
    const token = jwt.sign(
        { id: newUser.id, username: newUser.username, role: newUser.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        token,
        user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
        }
    });
});

/**
 * GET /api/auth/verify - Verify JWT token
 */
router.get('/verify', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token tidak ditemukan' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const users = getUsers();
        const user = users.find(u => u.id === decoded.id);

        if (!user) {
            return res.status(401).json({ error: 'User tidak ditemukan' });
        }

        res.json({
            valid: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(401).json({ error: 'Token tidak valid' });
    }
});

/**
 * POST /api/auth/change-password - Change password
 */
router.post('/change-password', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token tidak ditemukan' });
    }

    const token = authHeader.split(' ')[1];
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Password lama dan baru diperlukan' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password baru minimal 6 karakter' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === decoded.id);

        if (userIndex === -1) {
            return res.status(401).json({ error: 'User tidak ditemukan' });
        }

        const user = users[userIndex];

        if (!bcrypt.compareSync(currentPassword, user.password)) {
            return res.status(400).json({ error: 'Password lama salah' });
        }

        users[userIndex].password = bcrypt.hashSync(newPassword, 10);
        saveUsers(users);

        res.json({ success: true, message: 'Password berhasil diubah' });
    } catch (error) {
        return res.status(401).json({ error: 'Token tidak valid' });
    }
});

module.exports = router;
