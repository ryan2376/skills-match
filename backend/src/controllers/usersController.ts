// usersController.ts
import pool from "../config/db.config";
import asyncHandler from "../middlewares/asyncHandler";
import { Request, Response, NextFunction } from "express";


// only admins should get all users
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT * FROM users ORDER BY id ASC");
        res.status(200).json(result.rows);

        // Admin-only route
        // if (!req.user.isAdmin) {
        //     return res.status(403).json({ error: "Unauthorized" });
        // }
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal server error" });
    }

})