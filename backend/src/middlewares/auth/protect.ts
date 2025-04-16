// middlewares/auth/protect.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import pool from "../../config/db.config";
import { UserRequest } from "../../utils/types/userTypes";
import asyncHandler from "../asyncHandler";

export const protect = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token && req.cookies?.access_token) {
        token = req.cookies.access_token;
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify token
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }

        // Correct the type assertion to match the token payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { user_id: number; role: string; iat: number; exp: number };
        console.log("Decoded Token:", decoded);

        // Ensure user_id is a number
        const userId = decoded.user_id;
        if (typeof userId !== "number" || isNaN(userId)) {
            throw new Error("Invalid user_id in token");
        }

        const userQuery = await pool.query(
            "SELECT id, email, role, first_name, last_name, created_at, updated_at FROM users WHERE id = $1",
            [userId]
        );
        console.log("Query Result:", userQuery.rows);

        if (userQuery.rows.length === 0) {
            console.log("No user found for id:", userId);
            return res.status(401).json({ message: "User not found" });
        }

        // Attach user to request
        req.user = userQuery.rows[0];
        next();
    } catch (error) {
        console.error("JWT Error:", error);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
});