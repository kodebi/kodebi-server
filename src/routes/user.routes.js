import express from "express";
import userCtrl from "../controllers/user.controller";
import authCtrl from "../controllers/auth.controller";

const protectedRouter = express.Router();

protectedRouter.route("/").get(userCtrl.list); // Show users with GET

protectedRouter
  .route("/:userId")
  .all(userCtrl.userByID)
  .get(userCtrl.read) // Showing a user with GET
  .put(authCtrl.hasAuthorization, userCtrl.update) // Update with PUT
  .delete(authCtrl.hasAuthorization, userCtrl.remove); // Remove with DELETE

const router = express.Router();
router.route("/").post(userCtrl.create); // Create user with POST

export default { protectedRouter, router };
