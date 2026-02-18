"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const express_session_1 = __importDefault(require("express-session"));
const router_1 = __importDefault(require("./router"));
const authService_1 = require("./auth/authService");
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
exports.app = app;
const PORT = process.env.PORT || 3001;
// Initialize services before starting server
async function initializeServices() {
    try {
        console.log('🚀 Initializing GamePilot API services...');
        // Initialize authentication and database
        await (0, authService_1.initializeAuth)();
        console.log('✅ All services initialized successfully');
    }
    catch (error) {
        console.error('❌ Failed to initialize services:', error);
        process.exit(1);
    }
}
// Start server
async function startServer() {
    try {
        // Apply security middleware first
        app.use((0, helmet_1.default)({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "http://localhost:3001", "https://localhost:3001"],
                    fontSrc: ["'self'"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'none'"],
                },
            },
            crossOriginEmbedderPolicy: false,
        }));
        // Apply rate limiting
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 1000, // Limit each IP to 1000 requests per windowMs (increased for development)
            message: {
                error: 'Too many requests',
                message: 'Rate limit exceeded. Please try again later.'
            },
            standardHeaders: true,
            legacyHeaders: false,
        });
        app.use(limiter);
        // Stricter rate limiting for auth endpoints
        const authLimiter = (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 20, // Limit each IP to 20 auth requests per windowMs
            message: {
                error: 'Too many authentication attempts',
                message: 'Please try again later.'
            },
            standardHeaders: true,
            legacyHeaders: false,
        });
        // Apply CORS middleware
        const allowedOrigins = process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
            : ['https://gamepilot.com'];
        app.use((0, cors_1.default)({
            origin: (origin, callback) => {
                // Allow requests with no origin (like mobile apps or curl)
                if (!origin)
                    return callback(null, true);
                if (process.env.NODE_ENV !== 'production' || allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
                    callback(null, true);
                }
                else {
                    console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
                    console.info(`Allowed origins are: ${allowedOrigins.join(', ')}`);
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
        }));
        app.use((0, express_session_1.default)({
            secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            }
        }));
        app.use(express_1.default.json({ limit: '10mb' }));
        app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        app.use((0, cookie_parser_1.default)());
        // Apply request ID middleware
        app.use(errorHandler_1.requestIdMiddleware);
        // Serve static files from web app public directory
        app.use(express_1.default.static(path_1.default.join(__dirname, '../../web/public')));
        // Serve favicon.ico
        app.get('/favicon.ico', (req, res) => {
            res.sendFile(path_1.default.join(__dirname, '../../web/public/favicon.ico'));
        });
        // Apply routes
        app.use('/api', router_1.default);
        // Apply stricter rate limiting to auth routes
        app.use('/api/auth', authLimiter);
        // Debug endpoint to check environment variables
        app.get('/debug/env', (req, res) => {
            res.json({
                steamApiKey: process.env.STEAM_API_KEY ? 'SET' : 'NOT_SET',
                steamApiKeyLength: process.env.STEAM_API_KEY?.length || 0,
                port: process.env.PORT,
                nodeEnv: process.env.NODE_ENV
            });
        });
        // Root route for health check
        app.get("/", (req, res) => {
            res.status(200).send("GamePilot API OK");
        });
        // Apply error handling middleware (must be last)
        app.use(errorHandler_1.notFoundHandler);
        app.use(errorHandler_1.errorHandler);
        // Start listening
        const port = typeof PORT === 'string' ? parseInt(PORT) : PORT;
        console.log(`🔍 PORT environment variable: ${process.env.PORT}`);
        console.log(`🔍 Using port: ${port}`);
        app.listen(port, "0.0.0.0", () => {
            console.log(`🚀 GamePilot API server running on port ${port}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
// Initialize and start
initializeServices().then(startServer);
//# sourceMappingURL=index.js.map