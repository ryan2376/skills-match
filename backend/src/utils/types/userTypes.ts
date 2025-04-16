// userTypes.ts
import { Request } from "express";

// Define the possible roles as a TypeScript enum (mirroring the database enum)
export enum UserRole {
    admin = "admin",
    job_seeker = "job_seeker",
    employer = "employer",
}

/**
 * User type defining structure of a user record in PostgreSQL
 */
export interface User {
    id: string; // Changed from number to string (UUID)
    email: string;
    password_hash?: string;
    role: UserRole;
    first_name: string;
    last_name: string;
    created_at?: Date;
    updated_at?: Date;
}

/**
 * Custom Express Request Type to include `user` object
 */
export interface UserRequest extends Request {
    user?: User;
}