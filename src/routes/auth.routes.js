import express from "express";
import authCtrl from "../controllers/auth.controller.js";
import resetCtrl from "../controllers/reset.controller.js";
import counterCtrl from "../controllers/counter.controller.js";
import activationCtrl from "../controllers/activation.controller.js";

// Route: /auth
const router = express.Router();
router.route("/signin").post(authCtrl.signin);
router.route("/signout").get(authCtrl.signout);

router
    .route("/completeRegistration/:token/:userId")
    .get(activationCtrl.activateUser);

router
    .route("/failedUserActivation/:email")
    .get(
        activationCtrl.failedUserActivation,
        activationCtrl.requestUserActivation
    );

router.route("/requestPasswordReset").post(resetCtrl.requestPasswordReset); // Request password reset
router.route("/resetPassword").post(resetCtrl.resetPassword); // Reset Password

router.route("/totalBorrowedBooks").post(counterCtrl.getBorrowCounter);

export default router;
