import Conversation from "../models/conversation.model.js";
import { MessageModel } from "../models/messages.model.js";

const createConv = async (req, res) => {
    // Erstelt erste Nachricht und die zugehoerige Conversation
    // Füge erste Nachricht zu Conversation hinzu
    // add current user as sender
    req.body.senderId = req.auth._id;
    req.body.senderName = req.auth.name;
    const message = new MessageModel({ message: req.body.message });

    // Erstelle Conversation
    const conversation = new Conversation({ topic: req.body.topic, group: req.body.group });
    conversation.recipients.push({ id: req.body.senderId, name: req.body.senderName });
    conversation.messages.push(message);

    try {
        // Speichere Nachricht
        // await message.save();
        // Speichere Conversation
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
    // add current user as sender
    req.body.senderId = req.auth._id;
    req.body.senderName = req.auth.name;
    const message = new MessageModel(req.body);

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
    try {
        // populate messages.send _id name
        // fix here
        let convs = await Conversation.find({ recipients: req.params.userId })
            // .populate("messages", "_id message senderName senderId recieverName recieverId createdAt")
            .exec();
        if (!convs) {
            return res.status(404).json({
                error: "Benutzer hat noch keine Unterhaltungen"
            });
        }

        // Add found conversations to req for counting
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
        const conv = await Conversation.findById(req.params.convId)
            .populate("messages", "_id message senderName senderId recieverName recieverId createdAt")
            .exec();
        if (!conv) {
            return res.status(404).json({
                error: "Unterhaltung nicht gefunden"
            });
        }

        // check if sender of last message is not current user, then update readAt timestamp
        // messages.slice(-1)[0]
        // messages[messages.length -1]
        if (conv.messages.slice(-1)[0].senderId !== req.auth._id) {
            await conv.updateOne({ readAt: Date.now() }, { timestamps: false }).exec();
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
            for (let i = 0; i < 5; i++) {
                if (conv.messages.slice(-1)[i].senderId !== req.auth._id) {
                    counterUnread = counterUnread + 1;
                }
            }
        }

        return res.status(200).json({
            message: "Zahl der Ungelesene Unterhaltungen erhalten",
            unread: counterUnread
        });
    } catch (error) {
        return res.status(500).json({
            what: error.name
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
            // Remove messages
            // Notwendig?
            // await conv.messages.remove();

            // Delete conv if last iser
            const deletedConv = await conv.remove();

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

            // Delete messages

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

const read = (req, res) => {
    return res.status(200).json(req.conv);
};

export default {
    createConv,
    convByID,
    read,
    writeMessage,
    getConvByUser,
    deleteConvByID,
    countUnreadMessages
};
