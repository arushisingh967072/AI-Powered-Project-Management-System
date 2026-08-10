import mongoose, { Schema, Document } from "mongoose";

export interface ISprint extends Document {
  project: mongoose.Types.ObjectId;
  name: string;
  goal: string;
  startDate: Date;
  endDate: Date;
  status: "active" | "completed";
  assignedEmployees: mongoose.Types.ObjectId[];
}

const SprintSchema: Schema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Sprint Name is required"],
      trim: true,
    },
    goal: {
      type: String,
      required: [true, "Sprint Goal is required"],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    assignedEmployees: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISprint>("Sprint", SprintSchema);
