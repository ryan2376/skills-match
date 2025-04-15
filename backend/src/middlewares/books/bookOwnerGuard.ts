// bookOwnerGuard.ts
import { Response, NextFunction } from "express";
import asyncHandler from "../asyncHandler";
import pool from "../../config/db.config";
import { BookRequest } from "../../utils/types/bookTypes";


/**
 * @desc Middleware to ensure a user can only modify their own books
 * @access Private (Only Book Owners)
 */
export const bookOwnerGuard = asyncHandler<void, BookRequest>(async (req, res, next) => {
    const { id: bookId } = req.params;

    if (!req.user) {
        res.status(401).json({ message: "Not authorized" });
        return
    }

    // Check if the user is the owner of the book
    const bookQuery = await pool.query(
        "SELECT user_id FROM books WHERE id = $1",
        [bookId]
    );

    if (bookQuery.rows.length === 0) {
        res.status(404).json({ message: "Book not found" });
        return
    }

    if (bookQuery.rows[0].user_id !== req.user.id) {
        res.status(403).json({ message: "Not authorized to edit this book" });
        return
    }

    // Attach book details to request
    req.book = {
        id: bookQuery.rows[0].id,
        user_id: bookQuery.rows[0].user_id,
        title: bookQuery.rows[0].title,
        author: bookQuery.rows[0].author,
        genre: bookQuery.rows[0].genre,
        year: bookQuery.rows[0].year,
        pages: bookQuery.rows[0].pages,
        publisher: bookQuery.rows[0].publisher,
        description: bookQuery.rows[0].description,
        price: bookQuery.rows[0].price,
        image: bookQuery.rows[0].image,
        total_copies: bookQuery.rows[0].total_copies,
        available_copies: bookQuery.rows[0].available_copies,
        created_at: bookQuery.rows[0].created_at,
        updated_at: bookQuery.rows[0].updated_at
    };

    next();
});