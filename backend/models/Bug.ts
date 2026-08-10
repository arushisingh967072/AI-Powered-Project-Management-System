import mongoose, { Schema, Document } from "mongoose";

export interface IBug extends Document {
  project: mongoose.Types.ObjectId;
  sprint?: mongoose.Types.ObjectId;
  name: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  priority: "low" | "medium" | "high";
  assignedEmployee?: mongoose.Types.ObjectId;
  deadline: Date;
  status: "todo" | "in_progress" | "testing" | "done";
  reportedBy: mongoose.Types.ObjectId;
}

const BugSchema: Schema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    sprint: {
      type: Schema.Types.ObjectId,
      ref: "Sprint",
    },
    name: {
      type: String,
      required: [true, "Bug Name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Bug Description is required"],
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    assignedEmployee: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "testing", "done"],
      default: "todo",
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBug>("Bug", BugSchema);
