import mongoose from "mongoose";

const BookListEntrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    author: {
      type: String,
      trim: true
    },
    image: {
      type: String
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    ownerName: {
      type: String
    },
    borrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    borrowerName: {
      type: String
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book"
    }
  },
  {
    timestamps: true
  }
);

const bookListEntryExport = mongoose.model(
  "BookListEntry",
  BookListEntrySchema
);

const borrowedBookList = new mongoose.Schema(
  {
    borrowedBookList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BookListEntry"
      }
    ]
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
        ref: "BookListEntry"
      }
    ]
  },
  {
    timestamps: true
  }
);

const borrowedExport = mongoose.model("BorrowedBooks", borrowedBookList);
const bookmarkedExport = mongoose.model("BookmarkedBooks", bookmarkedBookList);

export default {
  bookListEntryExport,
  borrowedExport,
  bookmarkedExport
};
