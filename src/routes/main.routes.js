import express from "express";
import authCtrl from "../controllers/auth.controller";

import authRoutes from "./auth.routes";
import bookRoutes from "./book.routes";
import conversationRoutes from "./conversation.routes";
import userRoutes from "./user.routes";

const router = express.Router();
router.use("/api/books", bookRoutes.router);
router.use("/api/users", userRoutes.router);
router.use("/auth", authRoutes.router);

const protectedRouter = express.Router();
protectedRouter.use(
  "/api/books",
  authCtrl.requireSignin,
  bookRoutes.protectedRouter
);
protectedRouter.use(
  "/api/messages",
  authCtrl.requireSignin,
  conversationRoutes.protectedRouter
);
protectedRouter.use(
  "/api/users",
  authCtrl.requireSignin,
  userRoutes.protectedRouter
);

const mainRouter = express.Router();
mainRouter.use(router);
mainRouter.use(protectedRouter);

export default mainRouter;