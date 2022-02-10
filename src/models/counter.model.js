import mongoose from "mongoose";

const totalBorrowedBooks = new mongoose.Schema(
  {
    counterName: {
      type: String,
      required: true
    },
    totalBorrowedBooks: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("TotalBorrowedBooks", totalBorrowedBooks);
