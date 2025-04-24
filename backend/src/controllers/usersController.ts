// controllers/usersController.ts
import pool from "../config/db.config";
import asyncHandler from "../middlewares/asyncHandler";
import { Request, Response, NextFunction } from "express";
import { UserRequest } from "../utils/types/userTypes";
import { v4 as uuidv4 } from "uuid";
import { JobRequest } from "../utils/types/jobTypes";

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
// Add skills to the authenticated job seeker's profile
export const addUserSkills = asyncHandler(async (req: JobRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        if (req.user.role !== "job_seeker") {
            res.status(403).json({ message: "Access denied: Only job seekers can add skills" });
            return;
        }

        const { skills } = req.body;

        // Validate input
        if (!skills || !Array.isArray(skills) || skills.length === 0 || skills.some((skill: any) => typeof skill !== "string")) {
            res.status(400).json({ message: "Skills must be a non-empty array of strings" });
            return;
        }

        // Process each skill
        const skillIds: number[] = []; // Change to number[] since skills.id is an integer
        for (const skill of skills) {
            // Check if the skill already exists
            let skillResult = await pool.query(
                "SELECT id FROM skills WHERE name = $1",
                [skill]
            );

            let skillId: number;
            if (skillResult.rows.length === 0) {
                // Insert new skill (let PostgreSQL generate the ID)
                const insertResult = await pool.query(
                    "INSERT INTO skills (name, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING id",
                    [skill]
                );
                skillId = insertResult.rows[0].id;
            } else {
                skillId = skillResult.rows[0].id;
            }

            skillIds.push(skillId);
        }

        // Link the skills to the user in user_skills (avoid duplicates)
        for (const skillId of skillIds) {
            const existingLink = await pool.query(
                "SELECT 1 FROM user_skills WHERE user_id = $1::uuid AND skill_id = $2",
                [req.user.id, skillId]
            );

            if (existingLink.rows.length === 0) {
                await pool.query(
                    "INSERT INTO user_skills (user_id, skill_id, created_at, updated_at) VALUES ($1::uuid, $2, NOW(), NOW())",
                    [req.user.id, skillId]
                );
            }
        }

        res.status(200).json({ message: "Skills added successfully" });
    } catch (error) {
        console.error("Error adding user skills:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});