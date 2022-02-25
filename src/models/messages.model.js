import mongoose from "mongoose";
import crypto from "crypto";

const MessageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        senderName: {
            type: String,
            minLength: [2, "Sender Name zu kurz"],
            maxLength: [20, "Sender Name zu lang"]
        },
        recieverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        recieverName: {
            type: String,
            minLength: [2, "Empfänger Name zu kurz"],
            maxLength: [20, "Empfänger Name zu lang"]
        },
        message_encrypt: {
            type: String,
            required: [true, "Bitte Nachricht eingeben"]
        },
        message_secret: {
            type: String
        },
        message_iv: {
            type: String
        }
    },
    {
        timestamps: {
            createdAt: "createdAt"
        }
    }
);

MessageSchema.virtual("message")
    .set(function (message, next) {
        // global secret?
        this.message_secret = this.makeRandom(16);
        const iv = this.makeRandom(16);
        const cipher = crypto.createCipheriv(
            "aes-256-ctr",
            this.message_secret,
            iv
        );

        const encrypted = Buffer.concat([
            cipher.update(message, "utf8", "hex"),
            cipher.final("hex")
        ]);

        this.message_iv = iv.toString("hex");
        this.message_encrypt = encrypted.toString("hex");

        return next();
    })
    .get(function () {
        const decipher = crypto.createDecipheriv(
            "aes-256-ctr",
            this.message_secret,
            Buffer.from(this.message_iv, "hex")
        );

        const decrpyted = Buffer.concat([
            decipher.update(Buffer.from(this.message_encrypt, "hex")),
            decipher.final()
        ]);

        return decrpyted.toString("utf8");
    });

MessageSchema.methods = {
    makeRandom: function (b) {
        crypto.randomBytes(b, (err, buf) => {
            if (err) throw err;
            return buf.toString("hex");
        });
    }
};

export default mongoose.model("Message", MessageSchema);
