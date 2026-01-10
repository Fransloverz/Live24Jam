const express = require('express');
const cors = require('cors');
const streamRoutes = require('./routes/streams');
const systemRoutes = require('./routes/system');
const videosRoutes = require('./routes/videos');
const authRoutes = require('./routes/auth');
const schedulesRoutes = require('./routes/schedules');

// Start scheduler service (runs in background)
require('./services/scheduler');

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Increase timeout for large file uploads (30 minutes)
app.use((req, res, next) => {
    // Set timeout to 30 minutes for upload routes
    if (req.path.includes('/upload') || req.path.includes('/download')) {
        req.setTimeout(1800000); // 30 minutes
        res.setTimeout(1800000);
    }
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/streams', streamRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/schedules', schedulesRoutes);

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
