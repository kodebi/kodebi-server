import Book from "../models/book.model";
import extend from "lodash/extend";
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
    const bookEntry = new BorrowedBookList(req.book);
    bookEntry.borrowerId = req.profile._id;
    bookEntry.borrowerName = req.profile.name;
    bookEntry.book = req.book._id;

    await BorrowedBookList.findByIdAndUpdate(
      borrowListId,
      { $push: { borrowedBookList: bookEntry } },
      { upsert: true }
    ).exec();

    await BorrowedBookList.findByIdAndUpdate(
      ownBorrowListId,
      { $push: { borrowedBookList: bookEntry } },
      { upsert: true }
    ).exec();

    return res.status(201).json({
      message: "Buch Ausgliehen",
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
    const bookEntry = new BookmarkedBooks(req.book);
    bookEntry.borrowerId = "";
    bookEntry.borrowerName = "";
    bookEntry.book = req.book._id;

    await BookmarkedBooks.findByIdAndUpdate(
      bookmarksId,
      { $push: { bookmarkedBookList: bookEntry } },
      { new: true }
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
  getBookmarks
};
