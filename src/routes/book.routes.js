import express from "express";
import authCtrl from "../controllers/auth.controller.js";
import bookCtrl from "../controllers/book.controller.js";
import imgCtrl from "../controllers/image.controller.js";
import userCtrl from "../controllers/user.controller.js";
import counterCtrl from "../controllers/counter.controller.js";

// Route: /api/ book,borrow,return,bookmark
const protectedRouter = express.Router();
// book
// Create book
protectedRouter.route("/book/").post(imgCtrl.UploadImageToMemory, imgCtrl.UploadBookImageToImagekit, bookCtrl.create);

protectedRouter.route("/book/test/").post(bookCtrl.create);

// get book by bookid
protectedRouter
    .route("/book/:bookId")
    .all(bookCtrl.bookByID)
    .get(bookCtrl.read)
    .put(authCtrl.hasAuthorizationForBook, bookCtrl.update)
    .delete(authCtrl.hasAuthorizationForBook, imgCtrl.MoveBookToDeleteFolder, bookCtrl.remove);

// Update image
protectedRouter
    .route("/book/image/:bookId")
    .put(
        bookCtrl.bookByID,
        authCtrl.hasAuthorizationForBook,
        imgCtrl.UploadImageToMemory,
        imgCtrl.UploadBookImageToImagekit,
        bookCtrl.updateImage
    );

// New Route to getBooks by User
protectedRouter.route("/book/user/:userId").get(bookCtrl.bookByUser);

// borrow
protectedRouter.route("/borrow/").get(userCtrl.getOwnUser, bookCtrl.getBorrowed);

protectedRouter
    .route("/borrow/:bookId/user/:userId")
    .put(
        userCtrl.getOwnUser,
        userCtrl.userByID,
        bookCtrl.bookByID,
        authCtrl.hasAuthorizationForBook,
        counterCtrl.incremenBorrowCounter,
        bookCtrl.borrow
    );

protectedRouter
    .route("/return/:bookId")
    .put(userCtrl.getOwnUser, bookCtrl.bookByID, authCtrl.hasAuthorizationForBook, bookCtrl.returnBook);

//Bookmarks
protectedRouter.route("/bookmark/").get(userCtrl.getOwnUser, bookCtrl.getBookmarks);

protectedRouter.route("/bookmark/:bookId").put(userCtrl.getOwnUser, bookCtrl.bookByID, bookCtrl.bookmark);

// Only show some books?
const router = express.Router();
router.route("/").get(bookCtrl.list); //Seite mit allen hochgeladenen Büchern

export default { protectedRouter, router };
