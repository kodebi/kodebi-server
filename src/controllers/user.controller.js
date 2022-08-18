import extend from "lodash/extend";
import User from "../models/user.model.js";
import { BadRequestError, NotFoundError } from "../errors";

// Erstelle Benutzer
const create = async (req, res, next) => {
    // POST daher body
    req.body.activated = false;
    try {
        const user = new User(req.body);
        if (!req.body.password) {
            throw new BadRequestError("Ein Passwort ist notwendig.");
        } else if (req.body.password.length < 6) {
            throw new BadRequestError("Dein Passwort muss mindestens 6 Zeichen lang sein.");
        } else {
            await user.save();
            req.ownProfile = { _id: user._id, email: user.email };
            return next();
        }
    } catch (err) {
        return res.status(400).json({
            message: err.message
        });
    }
};

// Liste alle Benutzer auf
const list = async (req, res) => {
    try {
        const users = await User.find({
            deletedAt: { $eq: undefined }
        })
            .select("name")
            .exec();
        return res.json(users);
    } catch (err) {
        return res.status(500).json({
            what: err.name,
            message: err.message
        });
    }
};

// Einzelne Benutzer finden
// An die Anfrage anhaengen und weiterleiten
const userByID = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId, {
            hashed_password: 0,
            salt: 0,
            group: 0
        });
        if (!user) {
            throw new NotFoundError("User nicht gefunden");
        }
        req.profile = user;
        return next();
    } catch (err) {
        return res.status(err.statusCode).json({
            message: err.message
        });
    }
};

const getOwnUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.auth._id, {
            hashed_password: 0,
            salt: 0
        });
        if (!user) {
            throw new NotFoundError("User nicht gefunden");
        }
        req.ownProfile = user;
        return next();
    } catch (err) {
        return res.status(err.statusCode).json({
            message: err.message
        });
    }
};

// Lese Benutzer, Entferne Passwort
const read = (req, res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    req.profile.borrowedBooks = undefined;
    req.profile.bookmarkedBooks = undefined;
    // or only res specific fields?
    return res.json(req.profile);
};

// veraendere user
const update = async (req, res) => {
    try {
        let user = req.profile;
        if (req.body.password && req.body.password < 6) {
            throw new BadRequestError("Dein Passwort muss mindestens 6 Zeichen lang sein.");
        }
        // lodash - merge and extend user profile
        // restrict changes?
        user = extend(user, req.body);
        await user.save();
        return res.status(200).json({
            message: "Benutzer angepasst.",
            user: user._id
        });
    } catch (err) {
        return res.status(err.statusCode).json({
            message: err.message
        });
    }
};

// loesche user
const remove = async (req, res) => {
    try {
        // Soft Delete
        // Delete token in browser
        let user = req.profile;
        user.deletedAt = Date.now();
        await user.save();

        return res.status(200).json({
            message: "Benutzer gelöscht.",
            user: user._id
        });
    } catch (err) {
        return res.status(500).json({
            what: err.name
        });
    }
};

export default {
    create,
    userByID,
    getOwnUser,
    read,
    list,
    remove,
    update
};
