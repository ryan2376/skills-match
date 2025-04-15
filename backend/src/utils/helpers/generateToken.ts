// generateToken.ts
import  asyncHandler  from "../../middlewares/asyncHandler";
import { Response } from "express";
import dotenv  from "dotenv";
import jwt  from "jsonwebtoken";
import { ifError } from "assert";

dotenv.config()

// check if env vars are loaded correctly
// console.log("JWT Secret: ", process.env.JWT_SECRET);
// console.log("REFRESH_TOKEN_SECRET: ", process.env.REFRESH_TOKEN_SECRET);
// console.log("ACCESS_TOKEN_SECRET: ", process.env.ACCESS_TOKEN_SECRET);


export const generateToken = (res: Response, user_id: number, role_id: number, ) => {
    const jwtSecret = process.env.JWT_SECRET;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    // const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

    if(!jwtSecret || !refreshTokenSecret) {
        throw new Error('Missing JWT SECRETs in environment variables');
    }
    try {
        // generate a short-lived access token for 15mins
        const accessToken = jwt.sign({user_id, role_id}, jwtSecret, {expiresIn: "15m"});
        // generate a long-lived refresh token for 30 days
        const refreshToken = jwt.sign({user_id}, refreshTokenSecret, {expiresIn: "30d"})

        // set access token as httpOnly secure cookies
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
        })
        // set refresh token as httpOnly secure cookies
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        })

        return {accessToken, refreshToken}

    } catch (error) {
        console.error("Error generating JWT tokens:", error);
        throw new Error('Error generating JWT tokens');
    }
}


