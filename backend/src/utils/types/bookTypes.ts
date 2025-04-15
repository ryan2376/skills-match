// bookTypes.ts
import { UserRequest } from "./userTypes";

/**
 * Book type defining structure of a book record in PostgreSQL
 */
export interface Book {
    id: number; // Primary key
    user_id: number;
    title: string;
    author: string;
    genre: string;
    year: number;
    pages: number;
    publisher: string;
    description: string;
    price: number;
    image: string;
    total_copies: number; // Total number of copies in the library
    available_copies: number; // Number of copies currently available for borrowing
    created_at?: Date;
    updated_at?: Date;
}

/**
 * Custom Express Request Type for book-related middleware
 * This extends UserRequest so that req.user is available
 */
export interface BookRequest extends UserRequest {
    params: {
        id: string; // Ensures req.params.id always exists
    };
    book?: Book;
}