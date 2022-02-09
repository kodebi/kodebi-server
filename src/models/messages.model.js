import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    senderName: {
      type: String
    },
    recieverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    recieverName: {
      type: String
    },
    message: {
      type: String,
      required: [true, "Bitte Nachricht eingeben"]
    },
    group: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  {
    timestamps: {
      createdAt: "createdAt"
    }
  }
);

export default mongoose.model("Message", MessageSchema);
