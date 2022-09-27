import mongoose from "mongoose";
import { MessageSchema } from "./messages.model.js";

const ConversationSchema = new mongoose.Schema(
    {
        recipients: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        messages: [MessageSchema],
        book: {
            bookId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Book"
            },
            bookName: {
                type: String,
                trim: true
            },
            borrowed: {
                type: Boolean,
                default: false
            }
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
