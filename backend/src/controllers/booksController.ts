// bookController.ts

import { Response } from "express";
import pool from "../config/db.config";
import { UserRequest } from "../utils/types/userTypes";
import asyncHandler from "../middlewares/asyncHandler";
import { BookRequest } from "../utils/types/bookTypes";
/**
 * @desc Create a book
 * @route POST /api/v1/books
 * @access Librarian/admin Only
 */
export const createBook = asyncHandler(async (req: UserRequest, res: Response) => {
    //Modify the createbook function inside bookController.ts so that user_id is dynamically obtained from the logged-in user.
    //     ✅ Now, user_id is automatically set from the token instead of being manually provided.
    // ✅ Ensures only Librarian or Admin roles can create books.
    try {
        // Extract user_id from the authenticated user's token
        if (!req.user) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }

        const created_by = req.user.id; // User ID from token
        const { title, author, genre, year, pages, publisher, description, price, image, total_copies, available_copies } = req.body        
        
        // Ensure that only an Librarian or the Admin can create a book

        if (req.user.role_name !== "Librarian" && req.user.role_name !== "Admin") {
            res.status(403).json({ message: "Access denied: Only Librarians or Admins can create books" });
            return;
        }

        // Insert book into the database
        const bookResult = await pool.query(
            `INSERT INTO books ( title, author, genre, year, pages, publisher, description, price, image, total_copies, available_copies, created_by) 
             VALUES ($1, $2, $3, $4, $5 ,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
            [title, author, genre, year, pages, publisher, description, price, image, total_copies, available_copies, created_by]
        );

        res.status(201).json({
            message: "book created successfully",
            book: bookResult.rows[0]
        });

    } catch (error) {
        console.error("Error creating book:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get all books (Public - Attendees, Librarians, Admins)
export const getBooks = asyncHandler(async (req: BookRequest, res: Response) => {
    const result = await pool.query("SELECT * FROM books");
    res.status(200).json(result.rows);
});

// Get single book by ID (Public - Attendees, Librarians, Admins)
export const getBookById = asyncHandler(async (req: BookRequest, res: Response) => {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM books WHERE id=$1", [id]);

    if (result.rows.length === 0) {
        res.status(404).json({ message: "book not found" });
        return;
    }

    res.status(200).json(result.rows[0]);
});

// Update book (Only the book owner or Admin)
export const updatebook = asyncHandler(async (req: BookRequest, res: Response) => {
    const { id } = req.params;
    const { title, author, genre, year, pages, publisher, description, price, image, total_copies, available_copies, created_by } = req.body
    if (!req.user) {
        res.status(401).json({ message: "Not authorized" });
        return;
    }

    // Check if the book exists
    const bookQuery = await pool.query("SELECT created_by FROM books WHERE id=$1", [id]);

    if (bookQuery.rows.length === 0) {
        res.status(404).json({ message: "book not found" });
        return;
    }

    // Check if the user is the owner or an Admin
    if (bookQuery.rows[0].user_id !== req.user.id && req.user.role_name !== "Admin") {
        res.status(403).json({ message: "Not authorized to update this book" });
        return;
    }

    // Update book
    const result = await pool.query(
        "UPDATE books SET title=$1,author=$2,genre=$3,year=$4,pages=$5,publisher=$6,description=$7,price=$8,image=$9,total_copies=$10,available_copies=$11,created_by=$12, updated_at=NOW() WHERE id=$13 RETURNING *",
        [title, author, genre, year, pages, publisher, description, price, image, total_copies, available_copies, created_by, id]
    );

    res.json({ message: "book updated", book: result.rows[0] });
});

// Delete book (Only the book owner or Admin)
export const deleteBook = asyncHandler(async (req: BookRequest, res: Response) => {
    const { id } = req.params;

    if (!req.user) {
        res.status(401).json({ message: "Not authorized" });
        return;
    }

    // Check if the book exists
    const bookQuery = await pool.query("SELECT created_by FROM books WHERE id=$1", [id]);

    if (bookQuery.rows.length === 0) {
        res.status(404).json({ message: "book not found" });
        return;
    }

    // Check if the user is the owner or an Admin
    if (bookQuery.rows[0].user_id !== req.user.id && req.user.role_name !== "Admin") {
        res.status(403).json({ message: "Not authorized to delete this book" });
        return;
    }

    // Delete book
    await pool.query("DELETE FROM books WHERE id=$1", [id]);
    res.json({ message: "book deleted successfully" });
});