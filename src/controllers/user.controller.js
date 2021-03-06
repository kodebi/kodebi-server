import extend from "lodash/extend";
import User from "../models/user.model.js";

// Erstelle Benutzer
const create = async (req, res, next) => {
    // POST daher body
    req.body.activated = false;
    if (!req.body.password) {
        return res.status(500).json({
            error: "Ein Passwort ist notwendig."
        });
    }
    if (req.body.password.length < 6) {
        return res.status(500).json({
            error: "Dein Passwort muss mindestens 6 Zeichen lang sein."
        });
    }

    try {
        const user = new User(req.body);
        await user.save();
        req.ownProfile = { _id: user._id, email: user.email };
        return next();
    } catch (err) {
        return res.status(500).json({
            what: err.name,
            error: err.message
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
            error: err.message
        });
    }
};

// Einzelne Benutzer finden
// An die Anfrage anhaengen und weiterleiten
const userByID = async (req, res, next) => {
    try {
        let user = await User.findById(req.params.userId, {
            hashed_password: 0,
            salt: 0,
            group: 0
        }).exec();
        if (!user) {
            return res.status(404).json({
                error: "User nicht gefunden"
            });
        }
        req.profile = user;
        return next();
    } catch (err) {
        return res.status(500).json({
            error: "Could not retrieve user"
        });
    }
};

const getOwnUser = async (req, res, next) => {
    try {
        let user = await User.findById(req.auth._id, {
            hashed_password: 0,
            salt: 0
        }).exec();
        if (!user) {
            return res.status(404).json({
                error: "User nicht gefunden"
            });
        }
        req.ownProfile = user;
        return next();
    } catch (err) {
        return res.status(500).json({
            error: "Could not retrieve user"
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
            return res.status(500).json({
                error: "Dein Passwort muss mindestens 6 Zeichen lang sein."
            });
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
        return res.status(500).json({
            what: err.name
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
            message: "Benutzer gel??scht.",
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
