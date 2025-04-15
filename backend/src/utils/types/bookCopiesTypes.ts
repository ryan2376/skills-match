// bookCopiesTypes.ts
import { Book, BookRequest } from "./bookTypes";
import { UserRequest } from "./userTypes";

/**
 * Book type defining structure of a book record in PostgreSQL
 */
export interface BookCopy {
    copy_id: number; // Primary key
    book_id: number;    
    inventory_number: string;
    condition: string;
    status: string;
    location: string;
}

/**
 * Custom Express Request Type for book-related middleware
 * This extends UserRequest so that req.user is available
 */
export interface BookCopyRequest extends UserRequest,BookRequest{
    params: {
        id: string;// Ensures req.params.id always exists
        copy_id: string; // Ensures req.params.copy_id always exists
    };
    bookCopy?: BookCopy; // Corrected reference from Event to Book
}