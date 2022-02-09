import mongoose from "mongoose";

const totalBorrowedBooks = new mongoose.Schema(
  {
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
