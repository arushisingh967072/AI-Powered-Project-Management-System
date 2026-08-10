import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  targetType: "task" | "bug";
  targetId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  message: string;
  fileUrl?: string;
  fileName?: string;
}

const MessageSchema: Schema = new Schema(
  {
    targetType: {
      type: String,
      enum: ["task", "bug"],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      // Dynamic reference depending on targetType
      refPath: "targetModel",
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
    },
    fileUrl: {
      type: String,
    },
    fileName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMessage>("Message", MessageSchema);
