// bookCopiesController.ts
import { Response } from "express";
import pool from "../config/db.config";
import { UserRequest } from "../utils/types/userTypes";
import asyncHandler from "../middlewares/asyncHandler";
import { BookRequest, Book } from "../utils/types/bookTypes";
import { BookCopyRequest } from "../utils/types/bookCopiesTypes";

export const createBookCopy = asyncHandler(async (req: BookCopyRequest, res: Response) => {

    try {
        // Extract user_id from the authenticated user's token
        if (!req.user) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }

        // const created_by = req.user.id; // User ID from token
        const { book_id, inventory_number, condition, status, location } = req.body

        // Ensure that only an Librarian or the Adim can create an book copy

        if (req.user.role_name !== "Librarian" && req.user.role_name !== "Admin") {
            res.status(403).json({ message: "Access denied: Only Librarians or Admins can create books" });
            return;
        }
        // Insert book into the database
        const bookResult = await pool.query(
            `INSERT INTO bookcopies (book_id,inventory_number,condition,status,location) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [book_id, inventory_number, condition, status, location]
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

export const updateBookCopy = asyncHandler(async (req: BookCopyRequest, res: Response) => {
    try {
        // Extract copy_id from the authenticated user's token
        const { copy_id } = req.params;
        const { book_id, inventory_number, condition, status, location } = req.body;

        if (!req.user) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }

        // Check if the book exists
        const bookQuery = await pool.query("SELECT copy_id FROM bookcopies WHERE copy_id=$1", [copy_id]);

        if (bookQuery.rows.length === 0) {
            res.status(404).json({ message: "book not found" });
            return;
        }

        if (req.user.role_name !== "Librarian") {
            res.status(403).json({ message: "Access denied: Only Librarians can update book copy" });
            return;
        }

        const query = `
            UPDATE bookcopies
            SET book_id = COALESCE($1, book_id),
                inventory_number = COALESCE($2, inventory_number ),
                condition = COALESCE($3, condition),
                status = COALESCE($4, status),
                location = COALESCE($5, location)
            WHERE copy_id = $6
            RETURNING *;
        `;
        const values = [book_id || null, inventory_number  || null, condition || null, status || null, location || null, copy_id];
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ error: "Book not found" });
        }
    } catch (error) {
        console.error("Error updating book:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});