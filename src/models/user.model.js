import mongoose from "mongoose";
import crypto from "crypto";
// import { promisify } from "util";
import { BorrowedBooks, BookmarkedBooks } from "./bookList.model.js";

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, "Name ist erforderlich"],
            minLength: [2, "Name zu kurz"],
            maxLength: [20, "Name zu lang"]
        },
        image: {
            type: String
        },
        imagekitIoId: {
            type: String
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
            unique: true,
            match: [
                /^.+@(?:[\w-]+\.)+\w+$/,
                "Bitte gib eine gueltige Email Adresse an"
            ],
            required: [true, "Email ist erforderlich"]
        },
        hashed_password: {
            type: String,
            required: [true, "Passwort ist erforderlich"]
        },
        salt: String,
        activated: {
            type: Boolean,
            default: false
        },
        groups: [
            {
                type: String,
                trim: true,
                lowercase: true,
                minLength: [2, "Gruppen Name zu kurz"],
                maxLength: [20, "Gruppen Name  zu lang"]
            }
        ],
        deletedAt: {
            type: Date
        },
        borrowedBooks: {
            // maybe use subdocuments
            type: mongoose.Schema.Types.ObjectId,
            ref: "BorrowedBooks"
        },
        bookmarkedBooks: {
            // maybe use subdocuments
            type: mongoose.Schema.Types.ObjectId,
            ref: "BookmarkedBooks"
        }
    },
    {
        timestamps: true
    }
);

UserSchema.virtual("password").set(function (password) {
    this._password = password;
});

UserSchema.pre("validate", async function (next) {
    if (this._password && this._password.length < 6) {
        return false;
    }
    if (this.isNew && !this._password) {
        return false;
    }

    this.salt = await this.makeSaltAsync();
    this.hashed_password = await this.encryptPasswordAsync(this._password);
    next();
});

UserSchema.pre("save", function (next) {
    if (this.isNew) {
        const borrow = new BorrowedBooks();
        borrow.save();
        const bookmark = new BookmarkedBooks();
        bookmark.save();

        this.borrowedBooks = borrow._id;
        this.bookmarkedBooks = bookmark._id;
    }
    return next();
});

UserSchema.methods = {
    authenticate: function (plainTextInputPassword) {
        const keyBuffer = Buffer.from(
            this.encryptPassword(plainTextInputPassword),
            "hex"
        );
        const hashBuffer = Buffer.from(this.hashed_password, "hex");
        return crypto.timingSafeEqual(hashBuffer, keyBuffer);
    },
    encryptPasswordAsync: async function (password) {
        return new Promise((resolve, reject) => {
            if (!password) reject();
            const passwordBuffer = Buffer.from(password, "utf8");
            const saltBuffer = Buffer.from(this.salt, "utf8");
            crypto.scrypt(passwordBuffer, saltBuffer, 64, (err, pwHash) => {
                if (err) reject(err);
                resolve(pwHash.toString("hex"));
            });
        });
    },
    makeSaltAsync: async function () {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(20, (err, buf) => {
                if (err) reject(err);
                resolve(buf.toString("hex"));
            });
        });
    },
    encryptPassword: function (password) {
        if (!password) return "";
        try {
            const passwordBuffer = Buffer.from(password, "utf8");
            const saltBuffer = Buffer.from(this.salt, "utf8");
            return crypto
                .scryptSync(passwordBuffer, saltBuffer, 64)
                .toString("hex");
        } catch (err) {
            return "";
        }
    },
    makeSalt: function () {
        const buf = crypto.randomBytes(20);
        return buf.toString("hex");
    }
};

export default mongoose.model("User", UserSchema);
