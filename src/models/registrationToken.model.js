import mongoose from "mongoose";

const registrationToken = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is needed"]
    },
    token: {
      type: String,
      required: [true, "Token is needed"]
    },
    created: {
      type: Date,
      default: Date.now,
      expires: 3600
    }
  },
  {
    timestamps: false
  }
);

export default mongoose.model("registrationToken", registrationToken);
