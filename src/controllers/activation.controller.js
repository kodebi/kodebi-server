import nodemailer from "nodemailer";
import crypto from "crypto";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import registrationToken from "../models/registrationToken.model.js";
import config from "../config/config.js";

const failedUserActivation = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email }).exec();
    if (!user) {
        return res.status(404).json({
            error: "Benutzer nicht gefunden"
        });
    }
    // Add mail and id to request to rerequest the activation token
    req.ownProfile._id = user._id;
    req.ownProfile.email = user.email;
    return next();
};

const requestUserActivation = async (req, res) => {
    // Add email for rerequest? to find user
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

    try {
        await token.save();
    } catch (err) {
        return res.status(500).json({
            what: err.name,
            error: err.message
        });
    }

    const link = "http://app.kodebi.de/auth/completeRegistration/?token=" + registerToken + "&id=" + req.ownProfile._id;

    // if (process.env.NODE_ENV === "test") {
    //     console.info("Sending token directly");
    //     // Get token directly for testing
    //     return res.status(200).json({
    //         message: "Benutzer erfolgreich erstellt!",
    //         user: req.ownProfile._id,
    //         token: registerToken
    //     });
    // }

    sendRegisterUserMail(req.ownProfile.email, link);

    return res.status(200).json({
        message: "Benutzer erfolgreich erstellt!",
        user: req.ownProfile,
        token: registerToken
    });
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
    const info = await transporter.sendMail({
        from: mailFrom,
        bcc: mailFrom, // also send to self for docu
        to: mailTo, // list of receivers
        subject: "Kodebi Benutzer aktivieren", // Subject line
        text: "Um deinen Benutzer zu aktivieren klicke bitte diesen Link: " + resetLink, // plain text body
        html: "<b>Um deinen Benutzer zu aktivieren klicke bitte diesen Link:</b>" + resetLink // html body
    });

    console.log("Message sent: %s", info.messageId);
}

const activateUser = async (req, res) => {
    // We need userid, token
    if (!req.body.userId || !req.body.token) {
        return res.status(401).json({
            error: "Token nicht gefunden"
        });
    }

    const obId = mongoose.Types.ObjectId(req.body.userId);
    const activateToken = await registrationToken.findOne({ user: obId }).exec();

    if (!activateToken) {
        return res.status(401).json({
            error: "Token nicht gefunden"
        });
    }
    const hash = crypto.createHmac("sha256", config.userActivationSalt).update(req.body.token).digest("hex");
    const keyBuffer = Buffer.from(hash, "hex");
    const hashBuffer = Buffer.from(activateToken.token, "hex");
    const isValid = crypto.timingSafeEqual(keyBuffer, hashBuffer);
    if (!isValid) {
        await activateToken.deleteOne();
        return res.status(401).json({
            error: "Invalider oder abgelaufender Benutzer Aktivierungs Token"
        });
    }

    try {
        await User.findByIdAndUpdate(req.body.userId, {
            activated: true
        }).exec();
    } catch (err) {
        return res.status(500).json({
            what: err.name,
            error: err.message
        });
    }

    await activateToken.deleteOne();
    return res.status(200).json({
        message: "Benutzer Registrierung abgeschlossen! Du kannst dich jetzt anmelden."
    });
};

export default { requestUserActivation, activateUser, failedUserActivation };
