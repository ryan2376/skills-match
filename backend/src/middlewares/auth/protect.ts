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

        // Update the type assertion to expect user_id as a string (UUID)
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { user_id: string; role: string; iat: number; exp: number };
        console.log("Decoded Token:", decoded);

        // Validate user_id as a UUID string
        const userId = decoded.user_id;
        if (typeof userId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
            throw new Error("Invalid user_id in token: must be a valid UUID");
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