import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

// Load env vars
dotenv.config();

// Connect to DB
import connectDB from './src/config/db.js';

import errorHandler from './src/middleware/error.middleware.js';
import AppError from './src/utils/AppError.js';

// Routes
import authRoutes from './src/routes/auth.routes.js';
import bookingRoutes from './src/routes/booking.routes.js';
import userRoutes from './src/routes/user.routes.js';
import adminRoutes from './src/routes/admin.routes.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true // Allow cookies
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser()); // Parse cookies

// Routes
app.use('/api/auth', authRoutes); // if we had auth routes prefix
app.use('/api/users', userRoutes);
app.use('/api', bookingRoutes); // Check availability, bookings etc are top level or nested?
// Prompt: GET /api/availability, POST /api/bookings
// So bookingRoutes should be mounted at /api probably, or I need to adjust the paths in bookingRoutes.
// In booking.routes.js I defined /availability and /bookings etc. So mounting at /api works.

app.use('/api/admin', adminRoutes);

// Fix for /api/users routes if they weren't covered perfectly above
// The prompt said: GET /api/users/:id/bookings
// My userRoutes handles /:id/bookings. So /api/users matches.

// Health Check
app.get('/', (req, res) => {
  res.send('API is running...');
});

// 404
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect DB then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
})

export default app;