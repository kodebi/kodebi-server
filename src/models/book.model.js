import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, "Name des Buches fehlt"],
            minLength: [2, "Buch Name zu kurz"],
            maxLength: [40, "Buch Name zu lang"]
        },
        author: {
            type: String,
            trim: true,
            required: [true, "Autor des Buches fehlt"],
            minLength: [2, "Author zu kurz"],
            maxLength: [30, "Author zu lang"]
        },
        image: {
            type: String,
            required: [true, "Kein Bild ausgewählt"]
        },
        imagekitIoId: {
            type: String,
            required: [true, "Kein Bild ausgewählt"]
        },
        category: {
            type: String,
            trim: true,
            required: [true, "Bitte ein Genre eintragen"],
            minLength: [2, "Genre zu kurz"],
            maxLength: [20, "Genre zu lang"]
        },
        language: {
            type: String,
            trim: true,
            required: [true, "Bitte eine Sprache eintragen"],
            enum: ["Deutsch", "Englisch", "Spanisch", "Italienisch"]
        },
        condition: {
            //Zustand des Buches
            type: String,
            trim: true,
            required: [true, "Bitte den Zustand angeben"],
            enum: ["Druckfrisch", "Gut", "Viele Eselsohren"]
        },
        description: {
            //Beschreibung des Buches
            type: String,
            required: [true, "Bitte beschreibe dein Buch"],
            minLength: [20, "Beschreibung zu kurz"]
        },
        //User ID
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Bitte einen User eintragen"]
        },
        ownerName: {
            type: String,
            required: [true, "Bitte einen User eintragen"],
            minLength: [2, "Benutzer Name zu kurz"],
            maxLength: [20, "Benutzer Name zu lang"]
        },
        borrowerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        borrowerName: {
            type: String,
            minLength: [2, "Ausleiher Name zu kurz"],
            maxLength: [20, "Ausleiher Name zu lang"]
        },
        status: {
            type: String,
            trim: true,
            enum: ["Privat", "Bereit zum Verleihen", "Verliehen"],
            required: [true, "Bitte Status auswählen"]
        },
        timesBorrowed: {
            type: Number,
            default: 0
        },
        group: {
            type: String,
            trim: true,
            lowercase: true,
            minLength: [2, "Gruppen Name zu kurz"],
            maxLength: [20, "Gruppen Name  zu lang"]
        },
        deletedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Book", BookSchema);
