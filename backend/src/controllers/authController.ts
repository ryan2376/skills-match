// controllers/authController.ts
import pool from "../config/db.config";
import asyncHandler from "../middlewares/asyncHandler";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/helpers/generateToken";
import { UserRole } from "../utils/types/userTypes";
import jwt from "jsonwebtoken";

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { first_name, last_name, email, password, role } = req.body;

    if (!first_name || !last_name || !email || !password || !role) {
        res.status(400).json({ message: "All fields are required" });
        return;
    }

    if (role !== UserRole.job_seeker && role !== UserRole.employer) {
        res.status(400).json({ message: "Role must be 'Job Seeker' or 'Employer'" });
        return;
    }

    const emailCheck = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (emailCheck.rows.length > 0) {
        res.status(400).json({ message: "Email already exists" });
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
        "INSERT INTO users (first_name, last_name, email, password_hash, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, first_name, last_name, email, role, created_at, updated_at",
        [first_name, last_name, email, hashedPassword, role]
    );

    generateToken(res, newUser.rows[0].id, newUser.rows[0].role);

    res.status(201).json({
        message: "User successfully created",
        user: newUser.rows[0],
    });
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
    }

    const userQuery = await pool.query(
        "SELECT id, email, password_hash, role, first_name, last_name, created_at, updated_at FROM users WHERE email = $1",
        [email]
    );

    if (userQuery.rows.length === 0) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
    }

    const user = userQuery.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
    }

    const { accessToken } = generateToken(res, user.id, user.role);

    res.status(200).json({
        message: "User logged in successfully",
        access_token: accessToken,
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

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as { user_id: string };
        const userQuery = await pool.query(
            "SELECT id, role FROM users WHERE id = $1",
            [decoded.user_id]
        );

        if (userQuery.rows.length === 0) {
            return res.status(401).json({ message: "User not found" });
        }

        const user = userQuery.rows[0];
        const newAccessToken = jwt.sign({ user_id: user.id, role: user.role }, process.env.JWT_SECRET as string, {
            expiresIn: "15m",
        });

        res.cookie("access_token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        });

        res.status(200).json({
            access_token: newAccessToken,
        });
    } catch (error) {
        console.error("Refresh token error:", error);
        res.status(401).json({ message: "Invalid or expired refresh token" });
    }
});