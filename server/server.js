import express from 'express';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import chatRoutes from './routes/chat.routes.js';
import authRoutes from './routes/auth.routes.js';
import botRoutes from './routes/bot.routes.js';
import scrapDataRoutes from './routes/scrapper.routes.js';
import teamRoutes from './routes/team.routes.js';
import statsRoutes from './routes/stats.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import leadsRoutes from './routes/leads.routes.js';
import { initializeCronJobs } from './services/cronJobs.js';
import './config/passport.js';
import { databaseConnection } from './db/db.js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();
const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin:"*",
  })
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { secure: process.env.NODE_ENV === 'production' },
  })
);
// Allow CORS on /uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/chat', chatRoutes);
app.use('/auth', authRoutes);
app.use('/bot', botRoutes);
app.use('/scrap-data', scrapDataRoutes);
app.use('/team', teamRoutes);
app.use('/stats', statsRoutes);
app.use('/subscription', subscriptionRoutes);
app.use('/leads', leadsRoutes);

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;

databaseConnection(() => {
  app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
    
    // Initialize cron jobs after server starts
    initializeCronJobs();
  })
})