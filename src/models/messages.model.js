import mongoose from "mongoose";
import crypto from "crypto";

const MessageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        senderName: {
            type: String,
            minLength: [2, "Sender Name zu kurz"],
            maxLength: [20, "Sender Name zu lang"]
        },
        recieverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        recieverName: {
            type: String,
            minLength: [2, "Empfänger Name zu kurz"],
            maxLength: [20, "Empfänger Name zu lang"]
        },
        message: {
            type: String,
            required: [true, "Bitte Nachricht eingeben"],
            minLength: [2, "Nachricht zu kurz"],
            maxLength: [500, "Nachricht zu lang"]
        }
    },
    {
        timestamps: {
            createdAt: "createdAt"
        }
    }
);

const MessageModel = mongoose.model("Message", MessageSchema);
export { MessageSchema, MessageModel };
