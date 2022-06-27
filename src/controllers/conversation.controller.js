import Conversation from "../models/conversation.model.js";
import { MessageModel } from "../models/messages.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

const userByID = async (req) => {
    try {
        let user = await User.findById(req.body.recieverId, {
            hashed_password: 0,
            salt: 0,
            borrowedBooks: 0,
            bookmarkedBooks: 0,
            group: 0
        }).exec();

        return user;
    } catch (err) {
        return undefined;
    }
};

const createConv = async (req, res) => {
    const receiver = await userByID(req);

    if (!receiver) {
        return res.status(404).json({
            error: "User nicht gefunden"
        });
    }

    // Erstelt erste Nachricht und die zugehoerige Conversation
    const message = new MessageModel({
        message: req.body.message,
        senderId: req.auth._id,
        senderName: req.auth.name,
        recieverId: req.body.recieverId,
        recieverName: receiver.name
    });

    // Erstelle Conversation
    const conversation = new Conversation({ topic: req.body.topic, group: req.body.group });
    conversation.recipients.push(req.auth._id);
    conversation.recipients.push(req.body.recieverId);
    conversation.messages.push(message);

    try {
        await conversation.save();
        return res.status(201).json({
            message: "Nachricht erfolgreich gesendet!",
            nachricht: message,
            conversation: conversation
        });
    } catch (err) {
        return res.status(500).json({
            what: err.name,
            err: err.message
        });
    }
};

// Update conversation with new message
const writeMessage = async (req, res) => {
    const receiver = await userByID(req);

    if (!receiver) {
        return res.status(404).json({
            error: "User nicht gefunden"
        });
    }

    const message = new MessageModel({
        message: req.body.message,
        senderId: req.auth._id,
        senderName: req.auth.name,
        recieverId: req.body.recieverId,
        recieverName: receiver.name
    });

    try {
        // await message.save();
        // Add message to conversation
        await Conversation.findByIdAndUpdate(req.conv._id, { $push: { messages: message } }, { new: true }).exec();

        return res.status(201).json({
            message: "Nachricht erfolgreich gesendet!",
            nachricht: message
            // conversation: conversation
        });
    } catch (err) {
        return res.status(500).json({
            what: err.name,
            err: err.message
        });
    }
};

// Get All Conversations from User
const getConvByUser = async (req, res, next) => {
    const obId = mongoose.Types.ObjectId(req.params.userId);

    try {
        let convs = await Conversation.find({ recipients: obId }).exec();
        if (!convs) {
            return res.status(404).json({
                error: "Benutzer hat noch keine Unterhaltungen"
            });
        }

        req.conv = convs;
        return next();
    } catch (err) {
        return res.status(500).json({
            what: err.name,
            err: err.message
        });
    }
};

// Füge die Conversation mit bestimmer ID zum request hinzu
const convByID = async (req, res, next) => {
    try {
        const conv = await Conversation.findById(req.params.convId).exec();
        if (!conv) {
            return res.status(404).json({
                error: "Unterhaltung nicht gefunden"
            });
        }

        req.conv = conv;
        return next();
    } catch (err) {
        return res.status(500).json({
            what: err.name,
            err: err.message
        });
    }
};

// Update message readby
// Only update single conversation
const countUnreadMessages = async (req, res) => {
    try {
        const conv = req.conv;
        let counterUnread = 0;

        if (conv.updatedAt > conv.readAt) {
            // Only Check last 5 messages
            const msgs = conv.messages.slice(-5).reverse();
            for (const msg of msgs) {
                if (!msg.senderId.equals(req.auth._id)) {
                    counterUnread = counterUnread + 1;
                } else {
                    break;
                }
            }
        }
        return res.status(200).json({
            message: "Zahl der ungelesenen Unterhaltungen erhalten",
            unread: counterUnread
        });
    } catch (error) {
        return res.status(500).json({
            what: error.name,
            error: error.message
        });
    }
};

const deleteConvByID = async (req, res) => {
    try {
        let conv = req.conv;
        let isLastRecipient = false;
        if (req.conv.recipients.length <= 1) {
            isLastRecipient = true;
        }

        if (isLastRecipient) {
            const deletedConv = await conv.remove();
            // msg should be deleted with parent

            return res.status(200).json({
                message: "Unterhaltung gelöscht",
                conversation: deletedConv
            });
        } else {
            // Remove current user from conv
            let recipients = req.conv.recipients;
            let pos = recipients.indexOf(req.auth._id);
            // remove one element after pos (e.g. only the element on pos)
            recipients.splice(pos, 1);

            conv.recipients = recipients;
            await conv.save();

            return res.status(200).json({
                message: "Benutzer von Unterhaltung entfernt",
                conversation: conv
            });
        }
    } catch (err) {
        return res.status(500).json({
            what: err.name
        });
    }
};

const read = async (req, res) => {
    return res.status(200).json(req.conv);
};

const updateUnRead = async (req, _, next) => {
    // check if sender of last message is not current user, then update readAt timestamp
    const lastMsg = req.conv.messages.slice(-1)[0];
    if (!lastMsg.senderId.equals(req.auth._id)) {
        await req.conv.updateOne({ readAt: Date.now() }, { timestamps: false }).exec();
    }
    return next();
};

export default {
    createConv,
    convByID,
    read,
    writeMessage,
    getConvByUser,
    deleteConvByID,
    countUnreadMessages,
    updateUnRead
};
