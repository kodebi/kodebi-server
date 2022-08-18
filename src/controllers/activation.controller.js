import nodemailer from "nodemailer";
import crypto from "crypto";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import registrationToken from "../models/registrationToken.model.js";
import config from "../config/config.js";
import { NotFoundError, UnauthorizedError } from "../errors";

const failedUserActivation = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email }).exec();
        if (!user) {
            throw new NotFoundError("Benutzer nicht gefunden");
        }
        // Add mail and id to request to rerequest the activation token
        req.ownProfile._id = user._id;
        req.ownProfile.email = user.email;
        return next();
    } catch (err) {
        return res.status(err.statusCode).json({
            message: err.message
        });
    }
};

const requestUserActivation = async (req, res) => {
    // Add email for rerequest? to find user
    try {
        const oldtoken = await registrationToken.findOne({
            user: req.ownProfile._id
        });
        if (oldtoken) {
            await oldtoken.deleteOne();
        }
        const registerToken = crypto.randomBytes(32).toString("hex");
        const hash = crypto.createHmac("sha256", config.userActivationSalt).update(registerToken).digest("hex");
        const token = new registrationToken({
            user: req.ownProfile._id,
            token: hash
        });
        await token.save();
        const link = "http://app.kodebi.de/activate?token=" + registerToken + "&id=" + req.ownProfile._id;
        if (process.env.NODE_ENV === "test") {
            console.info("Sending token directly");
            // Get token directly for testing
            return res.status(200).json({
                message: "Der erste Schritt war erfolgreich! Halte Ausschau in deinen Emails nach Post von uns",
                user: req.ownProfile._id,
                token: registerToken,
                link: link
            });
        }
        sendRegisterUserMail(req.ownProfile.email, link);
        return res.status(200).json({
            message: "Der erste Schritt war erfolgreich! Halte Ausschau in deinen Emails nach Post von uns",
            user: req.ownProfile,
            token: registerToken
        });
    } catch (err) {
        return res.status(err.statusCode).json({
            message: err.message
        });
    }
};

async function sendRegisterUserMail(mailTo, resetLink) {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
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
    const info = transporter.sendMail({
        from: mailFrom,
        bcc: mailFrom,
        to: mailTo,
        subject: "Kodebi Benutzer aktivieren",
        text: "Um deinen Benutzer zu aktivieren klicke bitte diesen Link: " + resetLink,
        html: "<b>Um deinen Benutzer zu aktivieren klicke bitte diesen Link:</b>" + resetLink // html body
    });

    console.log("Message sent: %s", info.messageId);
}

const activateUser = async (req, res) => {
    // We need userid, token
    try {
        if (!req.body.userId || !req.body.token) {
            throw new UnauthorizedError("Token nicht gefunden");
        }
        const obId = mongoose.Types.ObjectId(req.body.userId);
        const activateToken = await registrationToken.findOne({ user: obId }).exec();
        if (!activateToken) {
            throw new UnauthorizedError("Token konnte nicht gefunden werden");
        }
        const hash = crypto.createHmac("sha256", config.userActivationSalt).update(req.body.token).digest("hex");
        const keyBuffer = Buffer.from(hash, "hex");
        const hashBuffer = Buffer.from(activateToken.token, "hex");
        const isValid = crypto.timingSafeEqual(keyBuffer, hashBuffer);
        if (!isValid) {
            await activateToken.deleteOne();
            throw new UnauthorizedError("Invalider oder abgelaufender Benutzer Aktivierungs Token");
        }
        await User.findByIdAndUpdate(req.body.userId, { activated: true }).exec();
        await activateToken.deleteOne();
        return res.status(200).json({
            message: "Benutzer Registrierung abgeschlossen! Du kannst dich jetzt anmelden."
        });
    } catch (err) {
        return res.status(err.statusCode).json({
            message: err.message
        });
    }
};

export default { requestUserActivation, activateUser, failedUserActivation };
