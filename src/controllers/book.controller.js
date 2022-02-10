import extend from "lodash/extend";
import Book from "../models/book.model";
import User from "../models/user.model";
import BorrowedBookList from "../models/bookList.model";
import BookmarkedBooks from "../models/bookList.model";

//Buch wird erstellt
const create = async (req, res) => {
  try {
    // overwrite the username und the user_id from the req
    req.body.ownerName = req.auth.name;
    req.body.ownerId = req.auth._id;

    const book = new Book(req.body);
    try {
      book.image = res.locals.BookUrl;
      book.imagekitIoId = res.locals.BookImageId;
    } catch (err) {
      return res.status(400).json({
        message: "You need to upload an image"
      });
    }
    await book.save();
    return res.status(200).json({
      message: "Book upload successful!",
      book: book,
      image: res.locals.BookUrl
    });
  } catch (err) {
    return res.status(500).json({
      what: err.name,
      err: err.message
    });
  }
};

//Liste aller Bücher
const list = async (req, res) => {
  try {
    let bookList = await Book.find().select(
      "name author image category owner language status updated created"
    );
    res.json(bookList);
  } catch (err) {
    return res.status(500).json({
      what: err.name
    });
  }
};

//Erhalte alle Buecher eines bestimmten Users
const bookByUser = async (req, res) => {
  try {
    // exec -> lean
    let books = await Book.find({ owner: req.params.userId }).exec();
    if (!books) {
      return res.status(404).json({
        error: "User has no books"
      });
    }
    res.json(books);
  } catch (err) {
    return res.status(500).json({
      what: err.name
    });
  }
};

//Buch über Buch-ID auswählen
const bookByID = async (req, res, next) => {
  try {
    let book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({
        error: "Book not found"
      });
    }
    req.book = book;
    next();
  } catch (err) {
    return res.status(500).json({
      what: err.name
    });
  }
};

//zuvor mit bookByID ausgewähltes Buch anzeigen
const read = (req, res) => {
  return res.json(req.book);
};

//verändere Buch mit PUT
const update = async (req, res) => {
  try {
    // Get Book
    let book = req.book;

    // overwrite the user_id from the req
    // with the old data from the book, so no one can change the book owner
    // Also don't allow to change the image in this route
    req.body.ownerName = book.ownerName;
    req.body.ownerId = book.ownerId;
    req.body.image = book.image;
    req.body.imagekitIoId = book.imagekitIoId;

    // Verändern der restlichen Buchdaten
    book = extend(book, req.body);
    await book.save();
    res.json(book);
  } catch (err) {
    return res.status(500).json({
      what: err.name
    });
  }
};

const updateImage = async (req, res) => {
  try {
    // Get Book
    let book = req.book;

    // Only Update image, image_id and timestamp
    book.image = res.locals.BookUrl;
    book.imagekitIoId = res.locals.BookImageId;

    // Save modified book to db
    await book.save();
    res.json(book);
  } catch (err) {
    return res.status(500).json({
      what: err.name
    });
  }
};

//lösche Buch
const remove = async (req, res) => {
  try {
    let book = req.book;

    //löscht die restlichen Buchdaten
    let deletedBook = await book.remove();

    return res.status(200).json({
      message: "Book successfully deleted!",
      book: deletedBook
    });
  } catch (err) {
    return res.status(500).json({
      what: err.name
    });
  }
};

const borrow = async (req, res) => {
  try {
    const borrowListId = req.profile.borrowedBooks._id;
    const ownBorrowListId = req.ownProfile.borrowedBooks._id;
    let book = req.book;
    book.borrowerId = req.profile._id;
    book.borrowerName = req.profile.name;
    book.timesBorrowed += 1;
    await book.save();

    await BorrowedBookList.findByIdAndUpdate(
      borrowListId,
      { $push: { borrowedBookList: book } },
      { upsert: true }
    ).exec();

    await BorrowedBookList.findByIdAndUpdate(
      ownBorrowListId,
      { $push: { borrowedBookList: book }, $inc: { totalBorrowedBooks: 1 } },
      { upsert: true }
    ).exec();

    return res.status(201).json({
      message: "Buch ausgliehen",
      borrower: req.profile.name
    });
  } catch (err) {
    return res.status(500).json({
      what: err.name
    });
  }
};

const getBorrowed = async (req, res) => {
  try {
    const borrowedId = req.ownProfile.borrowedBooks._id;
    const borrowed = await BorrowedBookList.findById(borrowedId)
      .populate("borrowedBookList")
      .exec();

    return res.status(200).json(borrowed);
  } catch (err) {
    return res.status(500).json({
      what: err.name
    });
  }
};

const bookmark = async (req, res) => {
  try {
    const bookmarksId = req.ownProfile.bookmarkedBooks._id;
    let book = req.book;

    await BookmarkedBooks.findByIdAndUpdate(
      bookmarksId,
      { $push: { bookmarkedBookList: book } },
      { new: true, upsert: true }
    ).exec();

    return res.status(201).json({
      message: "Buch gemerkt"
    });
  } catch (err) {
    return res.status(500).json({
      what: err.name
    });
  }
};

const deleteBookmark = async (req, res) => {
  try {
    const bookmarksId = req.ownProfile.bookmarkedBooks._id;
    let book = req.book;

    await BookmarkedBooks.findByIdAndUpdate(bookmarksId, {
      $pull: { bookmarkedBookList: book }
    }).exec();

    return res.status(201).json({
      message: "Buch von Merkliste entfernt"
    });
  } catch (err) {
    return res.status(500).json({
      what: err.name
    });
  }
};

const getBookmarks = async (req, res) => {
  try {
    const bookmarksId = req.profile.bookmarkedBooks._id;
    const bookmarks = await BookmarkedBooks.findById(bookmarksId)
      .populate("bookmarkedBookList")
      .exec();

    return res.status(200).json(bookmarks);
  } catch (err) {
    return res.status(500).json({
      what: err.name
    });
  }
};

const returnBook = async (req, res) => {
  try {
    const ownBorrowListId = req.ownProfile.borrowedBooks._id;
    let book = req.book;
    const borrower = await User.findById(req.book.borrowerId);

    await BorrowedBookList.findByIdAndUpdate(ownBorrowListId, {
      $pull: { borrowedBookList: book }
    }).exec();

    await BorrowedBookList.findByIdAndUpdate(borrower.borrowedBooks, {
      $pull: { borrowedBookList: book }
    }).exec();

    book.borrowerId = null;
    book.borrowerName = null;
    await book.save();

    return res.status(201).json({
      message: "Buch zurückgegeben",
      returner: req.profile.name
    });
  } catch (err) {
    return res.status(500).json({
      what: err.name
    });
  }
};

export default {
  create,
  list,
  bookByID,
  read,
  update,
  updateImage,
  remove,
  bookByUser,
  borrow,
  getBorrowed,
  bookmark,
  deleteBookmark,
  getBookmarks,
  returnBook
};
