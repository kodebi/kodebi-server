import mongoose from "mongoose";
import crypto from "crypto";
import BorrowedBooks from "./bookList.model";
import BookmarkedBooks from "./bookList.model";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name ist erforderlich"]
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
      match: [/.+\@.+\..+/, "Bitte gib eine gueltige Email Adresse an"],
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
    group: [
      {
        type: String,
        trim: true,
        lowercase: true
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

UserSchema.virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

UserSchema.path("hashed_password").validate(function () {
  // if (this.getUpdate().$set.password) for pw update
  if (this._password && this._password.length < 6) {
    this.invalidate(
      "password",
      "Password muss mindestens 6 Zeichen lang sein."
    );
  }
  if (this.isNew && !this._password) {
    this.invalidate("password", "Password ist erforderlich");
  }
}, "Passwort Fehler");

UserSchema.pre("save", function (next) {
  if (this.isNew) {
    const borrow = new BorrowedBooks();
    borrow.save();
    const bookmark = new BookmarkedBooks();
    bookmark.save();

    this.borrowedBooks = borrow._id;
    this.bookmarkedBooks = bookmark._id;
  }
  next();
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
  encryptPassword: function (password) {
    if (!password) return "";
    try {
      const passwordBuffer = Buffer.from(password, "utf8");
      return crypto.scryptSync(passwordBuffer, this.salt, 64).toString("hex");
    } catch (err) {
      return "";
    }
  },
  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + "";
  }
};

export default mongoose.model("User", UserSchema);
