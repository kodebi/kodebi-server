import express from "express";
import authCtrl from "../controllers/auth.controller";
import resetCtrl from "../controllers/reset.controller";
import counterCtrl from "../controllers/counter.controller";

const router = express.Router();
router.route("/signin").post(authCtrl.signin);
router.route("/signout").get(authCtrl.signout);

router.route("/requestPasswordReset").post(resetCtrl.requestPasswordReset); // Request password reset
router.route("/resetPassword").post(resetCtrl.resetPassword); // Reset Password

router.route("/totalBorrowedBooks").post(counterCtrl.getBorrowCounter);

export default router;