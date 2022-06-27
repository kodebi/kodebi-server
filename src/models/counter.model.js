import mongoose from "mongoose";

const count = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        count: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Counter", count);
