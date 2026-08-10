import { Router, Request } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getMessages, postMessage } from "../controllers/messageController";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.use(authenticate);

// Configure multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.get("/:targetType/:targetId", getMessages);
router.post("/", postMessage);

// File upload endpoint
router.post("/upload", upload.single("file"), (req: Request, res: any) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({
    success: true,
    fileUrl,
    fileName: req.file.originalname,
  });
});

export default router;
