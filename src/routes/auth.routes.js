import express from "express";
import authCtrl from "../controllers/auth.controller";
import resetCtrl from "../controllers/reset.controller";

const router = express.Router();
router.route("/signin").post(authCtrl.signin);
router.route("/signout").get(authCtrl.signout);

router.route("/requestPasswordReset").post(resetCtrl.requestPasswordReset); // Request password reset
router.route("/resetPassword").post(resetCtrl.resetPassword); // Reset Password

export default router;
