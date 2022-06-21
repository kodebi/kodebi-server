import express from "express";
import authCtrl from "../controllers/auth.controller.js";
import conversationCtrl from "../controllers/conversation.controller.js";

// Route: /api/messages
const protectedRouter = express.Router();

// Route: /api/messages
// Create conversation
protectedRouter.route("/").post(authCtrl.hasAuthorizationForNewMessage, conversationCtrl.createConv);

// Route for messages counter
protectedRouter
    .route("/unread/:convId")
    .get(conversationCtrl.convByID, authCtrl.hasAuthorizationForConversation, conversationCtrl.countUnreadMessages);

// Erstelle Nachricht in bestimmter Conversation, erhalte bestimmte Conversation
// Loesche Konversation
protectedRouter
    .route("/:convId")
    .all(conversationCtrl.convByID, authCtrl.hasAuthorizationForConversation)
    .get(conversationCtrl.read)
    .post(conversationCtrl.writeMessage)
    .delete(conversationCtrl.deleteConvByID);

// Erhalte alle Conversations in denen der User beteiligt ist
protectedRouter
    .route("/user/:userId")
    .get(authCtrl.hasAuthorizationForOwnMsg, conversationCtrl.getConvByUser, conversationCtrl.read);

export default { protectedRouter };
