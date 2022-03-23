import mongoose from "mongoose";
import Message from "./messages.model.js";

const ConversationSchema = new mongoose.Schema(
    {
        recipients: [
            {
                id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                name: {
                    type: String
                }
            }
        ],
        messages: [Message],
        topic: {
            type: String,
            trim: true,
            minLength: [2, "Topic zu kurz"],
            maxLength: [20, "Topic zu lang"]
        },
        group: {
            type: String,
            trim: true,
            lowercase: true,
            minLength: [2, "Gruppen Name zu kurz"],
            maxLength: [20, "Gruppen Name  zu lang"]
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
