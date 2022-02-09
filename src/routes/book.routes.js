import express from "express";
import authCtrl from "../controllers/auth.controller";
import bookCtrl from "../controllers/book.controller";
import imgCtrl from "../controllers/image.controller";
import userCtrl from "../controllers/user.controller";

const protectedRouter = express.Router();

// Create book
protectedRouter
  .route("/")
  .post(
    imgCtrl.UploadImageToMemory,
    imgCtrl.UploadBookImageToImagekit,
    bookCtrl.create
  );

// New Route to getBooks by User
protectedRouter.route("/user/:userId").get(bookCtrl.bookByUser);

// get book by bookid
protectedRouter
  .route("/:bookId")
  .all(bookCtrl.bookByID)
  .get(bookCtrl.read)
  .put(authCtrl.hasAuthorizationForBook, bookCtrl.update)
  .delete(
    authCtrl.hasAuthorizationForBook,
    imgCtrl.MoveBookToDeleteFolder,
    bookCtrl.remove
  );

// Update image
protectedRouter
  .route("/image/:bookId")
  .put(
    bookCtrl.bookByID,
    authCtrl.hasAuthorizationForBook,
    imgCtrl.UploadImageToMemory,
    imgCtrl.UploadBookImageToImagekit,
    bookCtrl.updateImage
  );

protectedRouter
  .route("/borrow/:bookId/user/:userId")
  .put(
    userCtrl.getOwnUser,
    userCtrl.userByID,
    authCtrl.hasAuthorizationForBook,
    bookCtrl.bookByID,
    bookCtrl.borrow
  );

protectedRouter.route("/borrow").put(userCtrl.getOwnUser, bookCtrl.getBorrowed);

protectedRouter
  .route("/bookmark/:bookId")
  .put(userCtrl.getOwnUser, bookCtrl.bookByID, bookCtrl.bookmark);

protectedRouter
  .route("/bookmark")
  .put(userCtrl.getOwnUser, bookCtrl.getBookmarks);

// Only show some books?
const router = express.Router();
router.route("/").get(bookCtrl.list); //Seite mit allen hochgeladenen Büchern

export default { protectedRouter, router };
