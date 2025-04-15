// bookRoutes.ts
import express from 'express'
import { createBook, getBooks, getBookById, updatebook, deleteBook } from '../controllers/booksController'
import { protect } from '../middlewares/auth/protect'
import { adminGuard, librarianGuard } from '../middlewares/auth/roleMiddleWare'
import { bookOwnerGuard } from '../middlewares/books/bookOwnerGuard'


const router = express.Router()


// Public Routes - Attendees can view events
router.get("/", getBooks);
router.get("/:id", getBookById);


// Protected Routes - Only Organizers can manage their own events
router.post("/", protect, librarianGuard, createBook);
// router.put("/:id", protect, librarianGuard, bookOwnerGuard, updateEvent);
// router.delete("/:id", protect, librarianGuard, bookOwnerGuard, deleteEvent);
router.post("/admin", protect, adminGuard, createBook);
router.put("/:id/admin", protect, adminGuard, updatebook);
router.delete("/:id", protect, librarianGuard, bookOwnerGuard, deleteBook);

// Admin Routes - Admins can manage all events
router.delete("/:id/admin", protect, adminGuard, deleteBook);



export default router