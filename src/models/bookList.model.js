import mongoose from "mongoose";

const borrowedBookList = new mongoose.Schema(
    {
        borrowedBookList: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Book"
            }
        ],
        totalBorrowedBooks: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const bookmarkedBookList = new mongoose.Schema(
    {
        bookmarkedBookList: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Book"
            }
        ]
    },
    {
        timestamps: true
    }
);

const BorrowedBooks = mongoose.model("BorrowedBooks", borrowedBookList);
const BookmarkedBooks = mongoose.model("BookmarkedBooks", bookmarkedBookList);

export { BorrowedBooks, BookmarkedBooks };
