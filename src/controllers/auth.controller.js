import jwt from "jsonwebtoken";
import expressJwt from "express-jwt";
import User from "../models/user.model.js";
import config from "../config/config.js";
import { UnauthorizedError, NotFoundError, InternalServerError, ForbiddenError } from "../errors";

const signin = async (req, res) => {
    let user;
    try {
        user = await User.findOne({
            email: req.body.email,
            deletedAt: { $eq: undefined }
        });
        // error handling
        if (!user) {
            throw new NotFoundError("Benutzer nicht gefunden");
        }
        if (!user.authenticate(req.body.password)) {
            throw new UnauthorizedError("Falsches Passwort");
        }
        if (!user.activated) {
            throw new UnauthorizedError("Bitte aktiviere dein Profil zuerst");
        }
    } catch (err) {
        return res.status(err.statusCode).json({
            message: err.message
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

        if (!token) {
            throw new InternalServerError("Konnte dich nicht anmelden. Der Fehler liegt bei uns");
        }

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
    } catch (err) {
        return res.status(err.statusCode).json({
            message: err.message
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
        const err = new ForbiddenError("Benutzer ist nicht berechtigt");
        return res.status(err.statusCode).json({
            message: err.message
        });
    }
    return next();
};

const hasAuthorizationForOwnMsg = (req, res, next) => {
    const authorized = req.auth && req.params.userId === req.auth._id;
    if (!authorized) {
        const err = new ForbiddenError("Benutzer ist nicht berechtigt");
        return res.status(err.statusCode).json({
            message: err.message
        });
    }
    return next();
};

const hasAuthorizationForNewMessage = (req, res, next) => {
    const authorized = req.body.senderId === req.auth._id;
    if (!authorized) {
        const err = new ForbiddenError("Benutzer ist nicht der Sender der neuen Nachricht");
        return res.status(err.statusCode).json({
            message: err.message
        });
    }
    return next();
};

const hasAuthorizationForConversation = (req, res, next) => {
    const isrecipient = req.conv.recipients.some((recipient) => recipient === req.auth._id);

    const authorized = req.auth && isrecipient;

    if (!authorized) {
        const err = new ForbiddenError("Benutzer ist nicht Teil der Unterhaltung");
        return res.status(err.statusCode).json({
            message: err.message
        });
    }
    return next();
};

//Dürfen BenutzerInnen etwas an einem Buch ändern?
const hasAuthorizationForBook = (req, res, next) => {
    const authorized = req.auth && req.book.ownerId.equals(req.auth._id);
    if (!authorized) {
        const err = new ForbiddenError("Benutzer ist nicht berechtigt für das Buch");
        return res.status(err.statusCode).json({
            message: err.message
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
