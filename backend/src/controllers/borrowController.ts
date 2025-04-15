// controllers/borrow.controller.ts
import { Request, Response } from 'express';
import { Pool } from 'pg';
import pool from '../config/db.config';
import { BorrowRequestBody, BorrowResponse, Borrow } from '../utils/types/borrowTypes';

export const createBorrow = async (req: Request, res: Response): Promise<void> => {
    const { book_id, user_id } = req.body as BorrowRequestBody;

    try {
        const bookCheck = await pool.query('SELECT * FROM public.books WHERE id = $1', [book_id]);
        if (bookCheck.rows.length === 0) {
            res.status(404).json({ message: 'Book not found' });
            return;
        }

        const userCheck = await pool.query('SELECT * FROM public.users WHERE id = $1', [user_id]);
        if (userCheck.rows.length === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const copyCheck = await pool.query(
            'SELECT * FROM public.bookcopies WHERE book_id = $1 AND status = $2 LIMIT 1',
            [book_id, 'Available']
        );
        if (copyCheck.rows.length === 0) {
            res.status(400).json({ message: 'No available copies of this book' });
            return;
        }

        const copyId = copyCheck.rows[0].copy_id;
        console.log('Selected copy ID:', copyId);

        await pool.query(
            'UPDATE public.bookcopies SET status = $1 WHERE copy_id = $2',
            ['Borrowed', copyId]
        );

        const borrowDate = new Date();
        const returnDate = new Date(borrowDate);
        returnDate.setDate(borrowDate.getDate() + 14);

        const newBorrow = await pool.query(
            `INSERT INTO public.borrows (user_id, book_id, copy_id, librarian_id, borrow_date, return_date, status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [
                user_id,
                book_id,
                copyId,
                null,
                borrowDate,
                returnDate,
                'Borrowed',
                new Date(),
                new Date()
            ]
        );

        const borrow: BorrowResponse = newBorrow.rows[0];
        res.status(201).json({
            message: 'Book borrowed successfully',
            borrow
        });
    } catch (error) {
        console.error('Error borrowing book:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getBorrowedBooks = async (req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.userId, 10);
    console.log('Fetching borrowed books for userId:', userId);

    try {
        const borrowedBooks = await pool.query(
            `SELECT b.*, bk.title AS book_title, bk.author AS book_author, bk.image AS book_image
            FROM public.borrows b
            JOIN public.books bk ON b.book_id = bk.id
            WHERE b.user_id = $1 AND b.status = $2`,
            [userId, 'Borrowed']
        );

        const borrows: Borrow[] = borrowedBooks.rows;
        res.status(200).json(borrows);
    } catch (error) {
        console.error('Error fetching borrowed books:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAllActiveBorrows = async (req: Request, res: Response): Promise<void> => {
    try {
        const activeBorrows = await pool.query(
            `SELECT b.*, bk.title AS book_title, bk.author AS book_author, bk.image AS book_image, u.name AS user_name
            FROM public.borrows b
            JOIN public.books bk ON b.book_id = bk.id
            JOIN public.users u ON b.user_id = u.id
            WHERE b.status = $1`,
            ['Borrowed']
        );

        const borrows: Borrow[] = activeBorrows.rows;
        res.status(200).json(borrows);
    } catch (error) {
        console.error('Error fetching active borrows:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
export const markAsReturned = async (req: Request, res: Response): Promise<void> => {
    const borrowId = parseInt(req.params.borrowId, 10);
    const librarianId = req.body.librarian_id;

    try {
        // Check if the borrow exists and is active
        const borrowCheck = await pool.query(
            'SELECT * FROM public.borrows WHERE borrow_id = $1 AND status = $2',
            [borrowId, 'Borrowed']
        );
        if (borrowCheck.rows.length === 0) {
            res.status(404).json({ message: 'Borrow not found or already returned' });
            return;
        }

        const borrow = borrowCheck.rows[0];

        // Check if the librarian exists
        const librarianCheck = await pool.query(
            'SELECT * FROM public.users WHERE id = $1 AND role_id = $2',
            [librarianId, 2]
        );
        if (librarianCheck.rows.length === 0) {
            res.status(404).json({ message: 'Librarian not found' });
            return;
        }

        // Update the borrow record
        const borrowUpdate = await pool.query(
            `UPDATE public.borrows
            SET status = $1, librarian_id = $2, updated_at = $3
            WHERE borrow_id = $4
             RETURNING *`,
            ['Returned', librarianId, new Date(), borrowId]
        );
        if (borrowUpdate.rows.length === 0) {
            throw new Error('Failed to update borrow record');
        }

        // Update the book copy status to 'Available'
        const copyUpdate = await pool.query(
            'UPDATE public.bookcopies SET status = $1 WHERE copy_id = $2 RETURNING *',
            ['Available', borrow.copy_id]
        );
        if (copyUpdate.rows.length === 0) {
            throw new Error(`Failed to update bookcopies record for copy_id ${borrow.copy_id}`);
        }

        res.status(200).json({ message: 'Book marked as returned successfully' });
    } catch (error) {
        console.error('Error marking book as returned:', error);
        res.status(500).json({ message: 'Server error'});
    }
};