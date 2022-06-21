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
    .set(function (message) {
        // global secret?
        this.message_secret = this.makeRandom(32);
        this.message_iv = this.makeRandom(16);
        const cipher = crypto.createCipheriv(
            "aes-256-cbc",
            Buffer.from(this.message_secret, "hex"),
            Buffer.from(this.message_iv, "hex")
        );

        let encrypted = cipher.update(message);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        this.message_encrypt = encrypted.toString("hex");
    })
    .get(function () {
        const decipher = crypto.createDecipheriv(
            "aes-256-cbc",
            this.message_secret,
            Buffer.from(this.message_iv, "hex")
        );

        const decrpyted = Buffer.concat([decipher.update(Buffer.from(this.message_encrypt, "hex")), decipher.final()]);

        return decrpyted.toString("utf8");
    });

MessageSchema.methods = {
    // makeRandom: function (b) {
    //     crypto.randomBytes(b, (err, buf) => {
    //         if (err) throw err;
    //         return buf.toString("hex");
    //     });
    // }
    makeRandom: function (b) {
        return crypto.randomBytes(b).toString("hex");
    }
};

const MessageModel = mongoose.model("Message", MessageSchema);
export { MessageSchema, MessageModel };
