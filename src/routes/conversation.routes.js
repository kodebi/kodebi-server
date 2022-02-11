import express from "express";
import authCtrl from "../controllers/auth.controller";
import conversationCtrl from "../controllers/conversation.controller";

const protectedRouter = express.Router();

// Check auth first
protectedRouter.use(authCtrl.requireSignin);

// refactor route dont use params, add them to routes if needed
// with req.query

// Route: /api/messages
// Create conversation
protectedRouter
  .route("/")
  .post(authCtrl.hasAuthorizationForNewMessage, conversationCtrl.createConv);

// Route for messages counter
protectedRouter
  .route("/unread/:convId")
  .get(
    authCtrl.hasAuthorizationForConversation,
    conversationCtrl.countUnreadMessages
  );

// Erstelle Nachricht in bestimmter Conversation, erhalte bestimmte Conversation
// Loesche Konversation
protectedRouter
  .route("/:convId")
  .all(authCtrl.hasAuthorizationForConversation)
  .get(conversationCtrl.read)
  .post(conversationCtrl.writeMessage)
  .delete(conversationCtrl.deleteConvByID);

// Erhalte alle Conversations in denen der User beteiligt ist
protectedRouter
  .route("/user/:userId")
  .get(
    authCtrl.hasAuthorization,
    conversationCtrl.getConvByUser,
    conversationCtrl.read
  );

export default protectedRouter;