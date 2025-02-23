import express, { Application } from 'express';
import userRoute from './routes/userRoutes';
import otpRoute from './routes/OtpRoutes';
import connectDB from './config/db';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path'; // Import path for static file handling
import adminRoute from './routes/adminRoutes';
import restaurentRoute from './routes/restaurentRoutes';
 import { startCronJobs } from './cronJobs';

const app: Application = express();

// Middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Database connection
connectDB();
 
// Start cron jobs
startCronJobs();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
 

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173', // Frontend origin
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
  credentials: true, // Allow cookies or authentication headers
};
app.use(cors(corsOptions)); 

// Routes
app.use('/users', userRoute);
app.use('/users/otp', otpRoute);
app.use('/admin',adminRoute)
app.use('/restaurent', restaurentRoute)

 
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

export default app;
