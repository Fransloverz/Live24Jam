const express = require('express');
const cors = require('cors');
const streamRoutes = require('./routes/streams');
const systemRoutes = require('./routes/system');
const videosRoutes = require('./routes/videos');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/streams', streamRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/videos', videosRoutes);

// Root route - API info
app.get('/', (req, res) => {
    res.json({
        name: 'Live24Jam API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/api/health',
            streams: '/api/streams',
            startStream: '/api/streams/:id/start',
            stopStream: '/api/streams/:id/stop'
        },
        documentation: 'https://github.com/your-repo/live24jam'
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Live24Jam API Server running on port ${PORT}`);
});
