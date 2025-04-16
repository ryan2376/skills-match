// controllers/usersController.ts
import pool from "../config/db.config";
import asyncHandler from "../middlewares/asyncHandler";
import { Request, Response, NextFunction } from "express";
import { UserRequest } from "../utils/types/userTypes";

// Get all users (Admin only)
export const getUsers = asyncHandler(async (req: UserRequest, res: Response) => {
    try {
        const result = await pool.query(
            "SELECT id, email, role, first_name, last_name, created_at, updated_at FROM users ORDER BY id ASC"
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get a single user by ID (Admin or self)
export const getUserById = asyncHandler(async (req: UserRequest, res: Response) => {
    try {
        const userId = req.params.id; // No parseInt, since id is a UUID string
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
            res.status(400).json({ message: "Invalid user ID: must be a valid UUID" });
            return;
        }

        // Check if the requesting user is an admin or the user themselves
        if (!req.user || (req.user.role !== "admin" && req.user.id !== userId)) {
            res.status(403).json({ message: "Access denied: Insufficient permissions" });
            return;
        }

        const result = await pool.query(
            "SELECT id, email, role, first_name, last_name, created_at, updated_at FROM users WHERE id = $1",
            [userId]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Update a user (Admin or self)
export const updateUser = asyncHandler(async (req: UserRequest, res: Response) => {
    try {
        const userId = req.params.id; // No parseInt, since id is a UUID string
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
            res.status(400).json({ message: "Invalid user ID: must be a valid UUID" });
            return;
        }

        // Check if the requesting user is an admin or the user themselves
        if (!req.user || (req.user.role !== "admin" && req.user.id !== userId)) {
            res.status(403).json({ message: "Access denied: Insufficient permissions" });
            return;
        }

        const { first_name, last_name, email, role } = req.body;

        // Validate input
        if (!first_name || !last_name || !email) {
            res.status(400).json({ message: "First name, last name, and email are required" });
            return;
        }

        // Check if the email is already in use by another user
        const emailCheck = await pool.query(
            "SELECT id FROM users WHERE email = $1 AND id != $2",
            [email, userId]
        );
        if (emailCheck.rows.length > 0) {
            res.status(400).json({ message: "Email already in use by another user" });
            return;
        }

        // If the role is provided, ensure it’s valid and the user is an admin
        let newRole = role;
        if (newRole) {
            if (req.user.role !== "admin") {
                res.status(403).json({ message: "Only admins can change user roles" });
                return;
            }
            const validRoles = ["admin", "job_seeker", "employer"];
            if (!validRoles.includes(newRole)) {
                res.status(400).json({ message: "Invalid role. Must be 'admin', 'job_seeker', or 'employer'" });
                return;
            }
        }

        // Update the user
        const result = await pool.query(
            `UPDATE users 
       SET first_name = $1, last_name = $2, email = $3, role = COALESCE($4, role), updated_at = NOW() 
       WHERE id = $5 
       RETURNING id, email, role, first_name, last_name, created_at, updated_at`,
            [first_name, last_name, email, newRole, userId]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Delete a user (Admin only)
export const deleteUser = asyncHandler(async (req: UserRequest, res: Response) => {
    try {
        const userId = req.params.id; // No parseInt, since id is a UUID string
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
            res.status(400).json({ message: "Invalid user ID: must be a valid UUID" });
            return;
        }

        // Only admins can delete users
        if (!req.user || req.user.role !== "admin") {
            res.status(403).json({ message: "Access denied: Insufficient permissions" });
            return;
        }

        // Prevent admins from deleting themselves
        if (req.user.id === userId) {
            res.status(400).json({ message: "Admins cannot delete themselves" });
            return;
        }

        const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [userId]);

        if (result.rows.length === 0) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});