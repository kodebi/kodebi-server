import extend from "lodash/extend";
import Book from "../models/book.model.js";
import User from "../models/user.model.js";
import { BorrowedBooks, BookmarkedBooks } from "../models/bookList.model.js";

//Buch wird erstellt
const create = async (req, res) => {
    try {
        // overwrite the username und the user_id from the req
        req.body.ownerName = req.auth.name;
        req.body.ownerId = req.auth._id;

        // book.image = res.locals.BookUrl;
        // book.imagekitIoId = res.locals.BookImageId;
        // if (!res.locals.BookUrl || !res.locals.BookImageId) {
        //     return res.status(400).json({
        //         message: "Dein Buch braucht ein Bild"
        //     });
        // }

        const book = new Book(req.body);

        await book.save();
        return res.status(200).json({
            message: "Buch erfolgreich erstellt!",
            book: book
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
        const bookList = await Book.find({
            deletedAt: { $eq: undefined }
        })
            .select("name author image category ownerId ownerName language status")
            .exec();
        res.json(bookList);
    } catch (err) {
        return res.status(500).json({
            what: err.name,
            err: err.message
        });
    }
};

//Erhalte alle Buecher eines bestimmten Users
const bookByUser = async (req, res) => {
    try {
        // exec -> lean
        const books = await Book.find({
            owner: req.params.userId,
            deletedAt: { $ne: undefined }
        }).exec();
        if (!books) {
            return res.status(404).json({
                error: "Benutzer hat noch keine Bücher"
            });
        }
        return res.json(books);
    } catch (err) {
        return res.status(500).json({
            what: err.name,
            err: err.message
        });
    }
};

//Buch über Buch-ID auswählen
const bookByID = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) {
            return res.status(404).json({
                error: "Buch nicht gefunden"
            });
        }
        req.book = book;
        return next();
    } catch (err) {
        return res.status(500).json({
            what: err.name,
            err: err.message
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
        // Object.assign(book, req.body) ?
        // const bookUpdate = req.body;
        // for (const key of Object.keys(bookUpdate)) {
        //     if (key in book) { // or obj1.hasOwnProperty(key)
        //         book[key] = bookUpdate[key];
        //     }
        // }
        book = extend(book, req.body);
        await book.save();
        return res.json(book);
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
        return res.json(book);
    } catch (err) {
        return res.status(500).json({
            what: err.name,
            err: err.message
        });
    }
};

//lösche Buch
const remove = async (req, res) => {
    try {
        let book = req.book;
        // Set inactive
        book.deletedAt = Date.now();
        let deletedBook = await book.save();

        return res.status(200).json({
            message: "Buch erfolgreich gelöscht!",
            book: deletedBook
        });
    } catch (err) {
        return res.status(500).json({
            what: err.name,
            err: err.message
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
        book.status = "Verliehen";
        await book.save();

        // setAll
        await BorrowedBooks.findByIdAndUpdate(borrowListId, { $push: { books: book } }, { upsert: true }).exec();

        await BorrowedBooks.findByIdAndUpdate(
            ownBorrowListId,
            {
                $push: { books: book },
                $inc: { counter: 1 }
            },
            { upsert: true }
        ).exec();

        return res.status(201).json({
            message: "Buch ausgliehen",
            book: book._id,
            borrower: req.profile.name
        });
    } catch (err) {
        return res.status(500).json({
            what: err.name,
            err: err.message
        });
    }
};

const getBorrowed = async (req, res) => {
    try {
        const borrowed = await BorrowedBooks.findById(req.ownProfile.borrowedBooks._id).populate("books").exec();
        return res.status(200).json(borrowed);
    } catch (err) {
        return res.status(500).json({
            what: err.name,
            err: err
        });
    }
};

const bookmark = async (req, res) => {
    let book = req.book;

    try {
        // setAll
        await BookmarkedBooks.findByIdAndUpdate(
            req.ownProfile.bookmarkedBooks._id,
            { $push: { books: book } },
            { new: true, upsert: true }
        ).exec();

        return res.status(201).json({
            message: "Buch gemerkt",
            book: book._id
        });
    } catch (err) {
        return res.status(500).json({
            what: err.name,
            err: err.message
        });
    }
};

const deleteBookmark = async (req, res) => {
    try {
        const bookmarksId = req.ownProfile.bookmarkedBooks._id;
        let book = req.book;

        await BookmarkedBooks.findByIdAndUpdate(bookmarksId, {
            $pullAll: { books: [book._id] }
        }).exec();

        return res.status(201).json({
            message: "Buch von Merkliste entfernt",
            book: book._id
        });
    } catch (err) {
        return res.status(500).json({
            what: err.name,
            err: err.message
        });
    }
};

const getBookmarks = async (req, res) => {
    try {
        const bookmarks = await BookmarkedBooks.findById(req.ownProfile.bookmarkedBooks._id).populate("books").exec();
        return res.status(200).json(bookmarks);
    } catch (err) {
        return res.status(500).json({
            what: err.name,
            err: err.message
        });
    }
};

const returnBook = async (req, res) => {
    try {
        const borrower = await User.findById(req.book.borrowerId);
        if (!borrower) {
            return res.status(201).json({
                message: "Buch nicht verliehen"
            });
        }

        const ownBorrowListId = req.ownProfile.borrowedBooks._id;
        let book = req.book;
        // pullAll
        await BorrowedBooks.findByIdAndUpdate(ownBorrowListId, {
            $pull: {
                books: { _id: book._id }
            }
        }).exec();

        await BorrowedBooks.findByIdAndUpdate(borrower.borrowedBooks, {
            $pull: {
                books: { _id: book._id }
            }
        }).exec();

        book.status = "Bereit zum Verleihen";
        book.borrowerId = undefined;
        book.borrowerName = undefined;
        await book.save();

        return res.status(201).json({
            message: "Buch zurückgegeben",
            returner: borrower.name
        });
    } catch (err) {
        return res.status(500).json({
            what: err.name,
            err: err.message
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
