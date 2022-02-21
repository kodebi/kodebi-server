import mongoose from "mongoose";
import Message from "./messages.model";

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
