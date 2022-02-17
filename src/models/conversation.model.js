import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    // Use subdocuments!!
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
      }
    ],
    topic: {
      type: String,
      trim: true
    },
    group: {
      type: String,
      trim: true,
      lowercase: true
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  }
);

export default mongoose.model("Conversation", ConversationSchema);
