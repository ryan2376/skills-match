// utils/helpers/generateToken.ts
import asyncHandler from "../../middlewares/asyncHandler";
import { Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export const generateToken = (res: Response, user_id: number, role: string) => {
    const jwtSecret = process.env.JWT_SECRET;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

    if (!jwtSecret || !refreshTokenSecret) {
        throw new Error("Missing JWT SECRETs in environment variables");
    }

    try {
        // Generate a short-lived access token for 15 mins
        const accessToken = jwt.sign({ user_id, role }, jwtSecret, { expiresIn: "15m" });

        // Generate a long-lived refresh token for 30 days
        const refreshToken = jwt.sign({ user_id }, refreshTokenSecret, { expiresIn: "30d" });

        // Set access token as httpOnly secure cookie
        res.cookie("access_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        });

        // Set refresh token as httpOnly secure cookie
        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error generating JWT tokens:", error);
        throw new Error("Error generating JWT tokens");
    }
};