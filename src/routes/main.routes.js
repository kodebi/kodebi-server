import express from "express";
import authCtrl from "../controllers/auth.controller.js";

import authRoutes from "./auth.routes.js";
import bookRoutes from "./book.routes.js";
import conversationRoutes from "./conversation.routes.js";
import userRoutes from "./user.routes.js";

const router = express.Router();
router.use("/api/books", bookRoutes.router);
router.use("/api/users", userRoutes.router);
router.use("/auth", authRoutes.router);

const protectedRouter = express.Router();
// book,borrow,return,bookmark
protectedRouter.use("/api/", authCtrl.requireSignin, bookRoutes.protectedRouter);
protectedRouter.use("/api/messages", authCtrl.requireSignin, conversationRoutes.protectedRouter);
protectedRouter.use("/api/users", authCtrl.requireSignin, userRoutes.protectedRouter);

const mainRouter = express.Router();
mainRouter.use(router);
mainRouter.use(protectedRouter);

export default mainRouter;
