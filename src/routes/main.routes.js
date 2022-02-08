import express from "express";
import authCtrl from "../controllers/auth.controller";

import authRoutes from "./auth.routes";
import bookRoutes from "./book.routes";
import conversationRoutes from "./conversation.routes";
import userRoutes from "./user.routes";

const router = express.Router();
router.use(bookRoutes.router);
router.use(userRoutes.router);
router.use(authRoutes.router);

const protectedRouter = express.Router();
protectedRouter.use(authCtrl.requireSignin, bookRoutes.protectedRouter);
protectedRouter.use(authCtrl.requireSignin, conversationRoutes.protectedRouter);
protectedRouter.use(authCtrl.requireSignin, userRoutes.protectedRouter);

const mainRouter = express.Router();
mainRouter.use(router);
mainRouter.use(protectedRouter);

export default mainRouter;
