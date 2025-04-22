// src/controllers/cvsController.ts
import { Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import pool from "../config/db.config";
import multer from "multer";
import path from "path";
import { CV, CVRequest } from "../utils/types/cvTypes";

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req: CVRequest, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, "uploads/"); // Store files in an uploads/ directory
    },
    filename: (req: CVRequest, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req: CVRequest, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        const filetypes = /pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error("Only PDF files are allowed!"));
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single("cv");

// Upload a CV (Job Seeker only)
export const uploadCV = [
    upload,
    asyncHandler(async (req: CVRequest, res: Response) => {
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const fileUrl = `/uploads/${req.file.filename}`;

        // Check if the user already has a CV
        const existingCV = await pool.query(
            "SELECT id FROM cvs WHERE user_id = $1",
            [req.user.id]
        );

        let result;
        if (existingCV.rows.length > 0) {
            // Update existing CV
            result = await pool.query(
                `UPDATE cvs
         SET file_url = $1, updated_at = NOW()
         WHERE user_id = $2
         RETURNING id, user_id, file_url, created_at, updated_at`,
                [fileUrl, req.user.id]
            );
        } else {
            // Insert new CV
            result = await pool.query(
                `INSERT INTO cvs (user_id, file_url, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         RETURNING id, user_id, file_url, created_at, updated_at`,
                [req.user.id, fileUrl]
            );
        }

        const cv: CV = result.rows[0];
        res.status(201).json(cv);
    }),
];

// Get a user's CV (Job Seeker, Employer, or Admin)
export const getCV = asyncHandler(async (req: CVRequest, res: Response) => {
    const userId = req.params.userId;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
        return res.status(400).json({ message: "Invalid user ID: must be a valid UUID" });
    }

    if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    // Check if the user is the owner, an employer, or an admin
    if (req.user.id !== userId && req.user.role !== "employer" && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied: You can only view your own CV or must be an employer/admin" });
    }

    const result = await pool.query(
        `SELECT id, user_id, file_url, created_at, updated_at
     FROM cvs
     WHERE user_id = $1`,
        [userId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "CV not found" });
    }

    const cv: CV = result.rows[0];
    res.status(200).json(cv);
});