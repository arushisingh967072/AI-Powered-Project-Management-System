import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";

import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import projectRoutes from "./routes/projectRoutes";
import sprintRoutes from "./routes/sprintRoutes";
import taskRoutes from "./routes/taskRoutes";
import bugRoutes from "./routes/bugRoutes";
import messageRoutes from "./routes/messageRoutes";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ===========================
   Middlewares
=========================== */

// Enable CORS with dynamic localhost port allowance and credential support
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      // Allow any localhost port
      if (origin.startsWith("http://localhost:") || origin === "http://localhost") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static folder for file uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* ===========================
   API Routes
=========================== */

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/sprints", sprintRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/bugs", bugRoutes);
app.use("/api/messages", messageRoutes);

/* ===========================
   Health API
=========================== */

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "AI Powered Project Management System API Running Successfully 🚀",
  });
});

/* ===========================
   Error Handler Middleware
=========================== */
app.use(errorHandler);

/* ===========================
   Start Server
=========================== */

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server Running on http://localhost:${PORT}`);
  });
};

startServer();