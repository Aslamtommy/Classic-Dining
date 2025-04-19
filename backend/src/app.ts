// src/index.ts
import express, { Application } from "express";
import { createServer, Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { initializeSocket } from "./socket";
import connectDB from "./config/db";
import userRoute from "./routes/userRoutes";
import otpRoute from "./routes/OtpRoutes";
import adminRoute from "./routes/adminRoutes";
import restaurentRoute from "./routes/restaurentRoutes";
import { startCronJobs } from "./cronJobs";

 
dotenv.config();

// Declare custom Request interface
declare global {
  namespace Express {
    export interface Request {
      data?: {
        id: string;
        role: string;
        userId?: string;
        email?: string;
      };
    }
  }
}

// Initialize Express app and HTTP server
const app: Application = express();
const httpServer: HttpServer = createServer(app);
export const io: SocketIOServer = initializeSocket(httpServer); // Attach Socket.IO to HTTP server

// Middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

 
// CORS configuration

const corsOptions = {
  origin:'https://classicdining.shop',
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get('/',()=>{
  console.log('backend running')
})
// Database connection
connectDB();

// Start cron jobs
startCronJobs();

// Routes
app.use("/users", userRoute);
app.use("/users/otp", otpRoute);
app.use("/admin", adminRoute);
app.use("/restaurent", restaurentRoute);

// Catch-all route for 404
app.use("*", (req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Test route to verify server is running
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Start the server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;