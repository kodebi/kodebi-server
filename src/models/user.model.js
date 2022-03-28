import mongoose from "mongoose";
import crypto from "crypto";
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
            required: "Password ist erforderlich"
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

UserSchema.path("hashed_password").validate(async function () {
    if (this._password && this._password.lenght < 6) {
        return false;
    }
    return await this.makeSaltAsync().then(
        this.encryptPasswordAsync(this._password)
    );
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
    encryptPasswordAsync: function (password) {
        if (!password) return "";
        console.log(typeof password);
        const passwordBuffer = Buffer.from(password, "utf8");
        const saltBuffer = Buffer.from(this.salt, "utf8");
        crypto.scrypt(passwordBuffer, saltBuffer, 64, (err, pwHash) => {
            if (err) throw err;
            // return pwHash.toString("hex");
            this.hashed_password = pwHash.toString("hex");
        });
    },
    makeSaltAsync: async function () {
        crypto.randomBytes(20, (err, buf) => {
            if (err) throw err;
            // return buf.toString("hex");
            this.salt = buf.toString("hex");
        });
    },
    makeSalt: function () {
        const buf = crypto.randomBytes(20);
        return buf.toString("hex");
    }
};

export default mongoose.model("User", UserSchema);
