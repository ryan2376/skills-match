// controllers/authController.ts
import pool from "../config/db.config";
import asyncHandler from "../middlewares/asyncHandler";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/helpers/generateToken";
import { UserRole } from "../utils/types/userTypes";

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { first_name, last_name, email, password, role } = req.body;

    // Validate input
    if (!first_name || !last_name || !email || !password || !role) {
        res.status(400).json({ message: "All fields are required" });
        return;
    }

    // Validate role (only "Job Seeker" or "Employer" allowed during registration)
    if (role !== UserRole.job_seeker && role !== UserRole.employer) {
        res.status(400).json({ message: "Role must be 'Job Seeker' or 'Employer'" });
        return;
    }

    // Check if email exists
    const emailCheck = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (emailCheck.rows.length > 0) {
        res.status(400).json({ message: "Email already exists" });
        return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the new user
    const newUser = await pool.query(
        "INSERT INTO users (first_name, last_name, email, password_hash, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, first_name, last_name, email, role, created_at, updated_at",
        [first_name, last_name, email, hashedPassword, role]
    );

    // Generate JWT token
    generateToken(res, newUser.rows[0].id, newUser.rows[0].role);

    res.status(201).json({
        message: "User successfully created",
        user: newUser.rows[0],
    });
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
    }

    // Check if user exists
    const userQuery = await pool.query(
        "SELECT id, email, password_hash, role, first_name, last_name, created_at, updated_at FROM users WHERE email = $1",
        [email]
    );

    if (userQuery.rows.length === 0) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
    }

    const user = userQuery.rows[0];

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
    }

    // Generate JWT token
    generateToken(res, user.id, user.role);

    res.status(200).json({
        message: "User logged in successfully",
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name,
            created_at: user.created_at,
            updated_at: user.updated_at,
        },
    });
});

export const logOutUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Clear access and refresh tokens
    res.cookie("access_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        expires: new Date(0),
    });

    res.cookie("refresh_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        expires: new Date(0),
    });

    res.status(200).json({
        message: "User logged out successfully",
    });
});