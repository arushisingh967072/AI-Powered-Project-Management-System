import mongoose, { Schema, Document } from "mongoose";

export interface IStatusHistory {
  status: "todo" | "in_progress" | "testing" | "done";
  updatedAt: Date;
  updatedBy: mongoose.Types.ObjectId;
}

export interface ITask extends Document {
  project: mongoose.Types.ObjectId;
  sprint?: mongoose.Types.ObjectId;
  name: string;
  description: string;
  techStack: string[];
  priority: "low" | "medium" | "high";
  assignedEmployee?: mongoose.Types.ObjectId;
  deadline: Date;
  status: "todo" | "in_progress" | "testing" | "done";
  statusHistory: IStatusHistory[];
}

const TaskSchema: Schema = new Schema(
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
      required: [true, "Task Name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Task Description is required"],
    },
    techStack: {
      type: [String],
      default: [],
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
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["todo", "in_progress", "testing", "done"],
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITask>("Task", TaskSchema);
