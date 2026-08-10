import mongoose, { Schema, Document } from "mongoose";

export interface ISRSDocument {
  introduction: {
    purpose: string;
    scope: string;
    objectives: string[];
  };
  overallDescription: string;
  functionalRequirements: {
    adminModule: string[];
    pmModule: string[];
    employeeModule: string[];
  };
  nonFunctionalRequirements: {
    performance: string;
    security: string;
    reliability: string;
    scalability: string;
  };
  generatedAt?: Date;
}

export interface IProject extends Document {
  name: string;
  description: string;
  techStack: string[];
  methodology: string;
  priority: "low" | "medium" | "high";
  status: "planning" | "active" | "completed";
  projectManager: mongoose.Types.ObjectId;
  assignedEmployees: mongoose.Types.ObjectId[];
  srsDocument?: ISRSDocument;
  startDate?: Date;
  endDate?: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Project Name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Project Description is required"],
    },
    techStack: {
      type: [String],
      default: [],
    },
    methodology: {
      type: String,
      default: "Agile/Scrum",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["planning", "active", "completed"],
      default: "planning",
    },
    projectManager: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedEmployees: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    srsDocument: {
      introduction: {
        purpose: { type: String, default: "" },
        scope: { type: String, default: "" },
        objectives: { type: [String], default: [] },
      },
      overallDescription: { type: String, default: "" },
      functionalRequirements: {
        adminModule: { type: [String], default: [] },
        pmModule: { type: [String], default: [] },
        employeeModule: { type: [String], default: [] },
      },
      nonFunctionalRequirements: {
        performance: { type: String, default: "" },
        security: { type: String, default: "" },
        reliability: { type: String, default: "" },
        scalability: { type: String, default: "" },
      },
      generatedAt: { type: Date },
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProject>("Project", ProjectSchema);
