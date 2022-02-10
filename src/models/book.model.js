import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name des Buches fehlt"]
    },
    author: {
      type: String,
      trim: true,
      required: [true, "Autor des Buches fehlt"]
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
      required: [true, "Bitte ein Genre eintragen"]
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
      required: [true, "Bitte beschreibe dein Buch"]
    },
    //User ID
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Bitte einen User eintragen"]
    },
    ownerName: {
      type: String,
      required: [true, "Bitte einen User eintragen"]
    },
    borrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    borrowerName: {
      type: String
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
      lowercase: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Book", BookSchema);
