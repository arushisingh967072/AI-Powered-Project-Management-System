import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import Message from "../models/Message";
import Task from "../models/Task";
import Bug from "../models/Bug";

/**
 * @desc    Get messages for a task or bug discussion panel
 * @route   GET /api/messages/:targetType/:targetId
 * @access  Private
 */
export const getMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { targetType, targetId } = req.params;

    if (!["task", "bug"].includes(targetType as string)) {
      res.status(400).json({ success: false, message: "Invalid discussion target type" });
      return;
    }

    // Verify target exists
    if (targetType === "task") {
      const task = await Task.findById(targetId);
      if (!task) {
        res.status(404).json({ success: false, message: "Task not found" });
        return;
      }
    } else {
      const bug = await Bug.findById(targetId);
      if (!bug) {
        res.status(404).json({ success: false, message: "Bug not found" });
        return;
      }
    }

    const messages = await Message.find({ targetType, targetId })
      .populate("sender", "name email role profilePicture")
      .sort("createdAt");

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Post a message to a discussion panel
 * @route   POST /api/messages
 * @access  Private
 */
export const postMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { targetType, targetId, message, fileUrl, fileName } = req.body;

    if (!targetType || !targetId || !message) {
      res.status(400).json({ success: false, message: "Required fields missing" });
      return;
    }

    if (!["task", "bug"].includes(targetType)) {
      res.status(400).json({ success: false, message: "Invalid target type" });
      return;
    }

    const newMessage = await Message.create({
      targetType,
      targetId,
      sender: req.user?._id,
      message,
      fileUrl,
      fileName,
    });

    const populatedMessage = await Message.findById(newMessage._id).populate(
      "sender",
      "name email role profilePicture"
    );

    res.status(201).json({
      success: true,
      message: "Message posted successfully",
      discussionMessage: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};
