// bookCopyRoutes.ts
import express from 'express'
import { createBook, getBooks, getBookById, updatebook, deleteBook } from '../controllers/booksController'
import { protect } from '../middlewares/auth/protect'
import { adminGuard, librarianGuard } from '../middlewares/auth/roleMiddleWare'
import { bookOwnerGuard } from '../middlewares/books/bookOwnerGuard'
import { createBookCopy, updateBookCopy } from '../controllers/bookCopiesController'




const router = express.Router()


router.post("/admin", protect, adminGuard, createBookCopy);
router.patch("/:copy_id/librarian", protect, librarianGuard, updateBookCopy);


export default router;