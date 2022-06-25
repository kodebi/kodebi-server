import jwt from "jsonwebtoken";
import expressJwt from "express-jwt";
import User from "../models/user.model.js";
import config from "../config/config.js";
import mongoose from "mongoose";

const signin = async (req, res) => {
    let user;
    try {
        user = await User.findOne({
            email: req.body.email,
            deletedAt: { $eq: undefined }
        }).exec();
    } catch (err) {
        return res.status(404).json({
            error: "Benutzer nicht gefunden"
        });
    }

    if (!user)
        return res.status(404).json({
            error: "Benutzer nicht gefunden"
        });

    if (!req.body.password) {
        return res.status(401).send({
            error: "Falsches Passwort"
        });
    }

    if (!user.authenticate(req.body.password)) {
        return res.status(401).send({
            error: "Falsches Passwort"
        });
    }

    if (!user.activated) {
        return res.status(401).send({
            error: "Bitte aktiviere dein Profil zuerst"
        });
    }

    // JSON Web Tokens
    try {
        const token = jwt.sign(
            {
                _id: user._id,
                name: user.name,
                groups: user.groups
            },
            config.jwtSecret,
            {
                expiresIn: "30 days",
                audience: "http://www.kodebi.de/api/",
                issuer: "http://www.kodebi.de"
            }
        );

        const oneDay = 1000 * 60 * 60 * 24;
        res.cookie("t", token, {
            httpOnly: true,
            expire: new Date(Date.now() + oneDay)
        });

        return res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                groups: user.groups
            }
        });
    } catch (error) {
        return res.status(500).json({
            what: err.name,
            error: "Konnte dich nicht anmelden"
        });
    }
};

const signout = (req, res) => {
    res.clearCookie("t");
    return res.status(200).json({
        message: "Benutzer abgemeldet"
    });
};

// Beschuetze Anfrage mit JWT
// Abfrage ob Benutzer angemeldet ist
// Wird in den Routen benutzt
// Read from auth header
const requireSignin = expressJwt({
    secret: config.jwtSecret,
    userProperty: "auth",
    algorithms: ["HS256"],
    issuer: "http://www.kodebi.de",
    audience: "http://www.kodebi.de/api/"
});

// Darf der Benutzer die Aktion ausfuehren?
// Sein eigenes Profil bearbeiten ist in Ordnung
const hasAuthorization = (req, res, next) => {
    const authorized = req.profile && req.auth && req.profile._id.equals(req.auth._id);

    if (!authorized) {
        return res.status(403).json({
            error: "Benutzer ist nicht berechtigt"
        });
    }
    return next();
};

const hasAuthorizationForOwnMsg = (req, res, next) => {
    const authorized = req.auth && req.params.userId.equals(req.auth._id);
    if (!authorized) {
        return res.status(403).json({
            error: "Benutzer ist nicht berechtigt"
        });
    }
    return next();
};

const hasAuthorizationForNewMessage = (req, res, next) => {
    const authorized = req.body.senderId.equals(req.auth._id);

    if (!authorized) {
        return res.status(403).json({
            error: "Benutzer ist nicht der Sender der neuen Nachricht"
        });
    }
    return next();
};

const hasAuthorizationForConversation = (req, res, next) => {
    const isrecipient = req.conv.recipients.some((recipient) => recipient.equals(req.auth._id));

    const authorized = req.auth && isrecipient;

    if (!authorized) {
        return res.status(403).json({
            error: "Benutzer ist nicht Teil der Unterhaltung"
        });
    }
    return next();
};

//Dürfen BenutzerInnen etwas an einem Buch ändern?
const hasAuthorizationForBook = (req, res, next) => {
    const authorized = req.auth && req.book.ownerId.equals(req.auth._id);
    if (!authorized) {
        return res.status(403).json({
            error: "Benutzer ist nicht berechtigt für das Buch"
        });
    }
    return next();
};

export default {
    signin,
    signout,
    requireSignin,
    hasAuthorization,
    hasAuthorizationForBook,
    hasAuthorizationForConversation,
    hasAuthorizationForNewMessage,
    hasAuthorizationForOwnMsg
};
