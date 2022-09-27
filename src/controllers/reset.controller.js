import nodemailer from "nodemailer";
import crypto from "crypto";
import User from "../models/user.model.js";
import passwordResetToken from "../models/passwordResetToken.model.js";
import config from "../config/config.js";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "../errors";

const requestPasswordReset = async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).exec();
    try {
        if (!user) {
            throw new NotFoundError("Benutzer nicht gefunden");
        }
        const oldtoken = await passwordResetToken.findOne({ user: user._id });
        if (oldtoken) {
            await oldtoken.deleteOne();
        }
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hash = crypto.createHmac("sha256", config.passwortResetSalt).update(resetToken).digest("hex");
        const token = new passwordResetToken({
            user: user._id,
            token: hash
        });
        await token.save();
        const link = "http://app.kodebi.de/reset?token=" + resetToken + "&id=" + user._id;
        if (process.env.NODE_ENV === "test") {
            console.info("Sending token directly");
            // Get token directly for testing
            return res.status(200).json({
                message: "Der erste Schritt war erfolgreich! Halte Ausschau in deinen Emails nach Post von uns",
                user: user._id,
                token: resetToken,
                link: link
            });
        }
        sendPasswordResetMail(user.email, link);
        return res.status(200).json({
            message: "Der erste Schritt war erfolgreich! Halte Ausschau in deinen Emails nach Post von uns"
        });
    } catch (err) {
        return res.status(err.statusCode).json({
            message: err.message
        });
    }
};

async function sendPasswordResetMail(mailTo, resetLink) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: config.mailSmtpServer,
        port: 465,
        secure: true,
        auth: {
            user: config.mailUser,
            pass: config.mailPass
        }
    });

    const mailFrom = { name: "Kodebi Passwort", address: config.mailFrom };

    // send mail with defined transport object
    let info = transporter.sendMail({
        from: mailFrom,
        bcc: mailFrom,
        to: mailTo,
        subject: "Kodebi Passwort Zurücksetzen",
        text: "Um dein Passwort zurückzusetzen klicke bitte diesen Link: " + resetLink,
        html: "<b>Um dein Passwort zurückzusetzen klicke bitte diesen Link:</b>" + resetLink // html body
    });

    console.log("Message sent: %s", info.messageId);
}

const resetPassword = async (req, res) => {
    // We need userid, reset token, new password
    try {
        if (!req.body.password) {
            throw new ForbiddenError("Ein neues Passwort ist notwendig");
        }
        const resetToken = await passwordResetToken.findOne({ user: req.body.userId }).exec();
        if (!resetToken) {
            throw new UnauthorizedError("Token nicht gefunden");
        }
        const hash = crypto.createHmac("sha256", config.passwortResetSalt).update(req.body.token).digest("hex");
        const keyBuffer = Buffer.from(hash, "hex");
        const hashBuffer = Buffer.from(resetToken.token, "hex");
        const isValid = crypto.timingSafeEqual(keyBuffer, hashBuffer);
        if (!isValid) {
            await resetToken.deleteOne();
            throw new ForbiddenError("Invalider oder abgelaufender Passwort Reset Token");
        }
        // Use save for validators
        const user = await User.findById(req.body.userId).exec();
        if (!user) {
            throw new NotFoundError("Benutzer nicht gefunden");
        }
        if (req.body.password < 6) {
            throw new BadRequestError("Dein Passwort muss mindestens 6 Zeichen lang sein!");
        }
        user.password = req.body.password;
        await user.save();
        await resetToken.deleteOne();
        return res.status(200).json({
            message: "Dein neues Passwort wurde erfolgreich eingerichtet. Logge dich nun damit ein."
        });
    } catch (err) {
        return res.status(err.statusCode).json({
            message: err.message
        });
    }
};

export default { requestPasswordReset, resetPassword };
