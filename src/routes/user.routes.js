import express from "express";
import userCtrl from "../controllers/user.controller.js";
import authCtrl from "../controllers/auth.controller.js";
import activationCtrl from "../controllers/activation.controller.js";
// import { userValidator, validate } from "../helpers/validator.js";

// Route: /api/users
const protectedRouter = express.Router();

protectedRouter.route("/").get(userCtrl.list); // Show users with GET

protectedRouter
    .route("/:userId")
    .all(userCtrl.userByID)
    .get(userCtrl.read) // Showing a user with GET
    .put(authCtrl.hasAuthorization, userCtrl.update) // Update with PUT
    .delete(authCtrl.hasAuthorization, userCtrl.remove, authCtrl.signout); // Remove with DELETE

const router = express.Router();
router.route("/").post(userCtrl.create, activationCtrl.requestUserActivation); // Create user with POST

export default { protectedRouter, router };
