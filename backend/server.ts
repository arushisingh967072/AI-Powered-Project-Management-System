import "dotenv/config";

import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import connectDB from "./config/db";

import authRoutes from "./routes/authRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import projectRoutes from "./routes/projectRoutes";
import sprintRoutes from "./routes/sprintRoutes";
import taskRoutes from "./routes/taskRoutes";
import bugRoutes from "./routes/bugRoutes";
import messageRoutes from "./routes/messageRoutes";
import searchRoutes from "./routes/searchRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";


import { errorHandler } from "./middlewares/errorHandler";

const app = express();

const PORT = process.env.PORT || 5000;

/* ===========================
   Middlewares
=========================== */

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin
      // (Postman, mobile apps, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      // Allow localhost origins
      if (
        origin.startsWith("http://localhost:") ||
        origin === "http://localhost"
      ) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Parse JSON request body
app.use(express.json());

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// Static folder for file uploads
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

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

app.use("/api/search", searchRoutes);

app.use("/api/analytics", analyticsRoutes);

/* ===========================
   Health Check
=========================== */

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message:
      "AI Powered Project Management System API Running Successfully",
  });
});

/* ===========================
   Error Handler
   IMPORTANT: Keep this LAST
=========================== */

app.use(errorHandler);

/* ===========================
   Start Server
=========================== */

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server Running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();