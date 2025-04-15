// authControllers.ts
import pool from "../config/db.config";
import  asyncHandler  from "../middlewares/asyncHandler";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs"
import { generateToken } from "../utils/helpers/generateToken";

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, role_id } = req.body

    // check if email exists
    const emailCheck = await pool.query("SELECT id FROM users WHERE email = $1", [email])
    if (emailCheck.rows.length > 0) {
        res.status(400).json({ message: "User already exists" });
        return;
    }

    // hashing before inserting into users
    const salt = await bcrypt.genSalt(10) //no of rounds you want to hash
    const hashedPassword = await bcrypt.hash(password, salt);

    // insert into users 
    const newUser = await pool.query(
        "INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, email, hashedPassword, role_id]
    )

    // gen JWT token
    generateToken(res, newUser.rows[0].id, newUser.rows[0].role_id)

    res.status(201).json({
        message: "User successfully created",
        user: newUser.rows[0]
    });

    // next() - automatically redirect if user is successfully created
})


export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    console.log(req.headers);
    const { email, password } = req.body

    // check if user exists
    const userQuery = await pool.query(`SELECT users.id, users.name, users.email, users.password, users.role_id, user_roles.role_name 
        FROM users 
        JOIN user_roles ON users.role_id = user_roles.role_id WHERE email =$1`, [email]
    );

    if (userQuery.rows.length === 0) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
    }

    // query the user
    const user = userQuery.rows[0];

    // compare hashed password with the one in the database
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
    }

    //  gen jwt token for session
    generateToken(res, user.id, user.role_id)

    res.status(200).json({
        message: "User logged in successfully",
        user
    });

    // next() - automatically redirect if user is successfully logged in
})


export const logOutUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // we need to immediately invalidate the access token and refresh token
    res.cookie('access_token', "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        expires: new Date(0),//expire immediately
    });

    res.cookie('refresh_token', "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        expires: new Date(0),//expire immediately
    })



    res.status(200).json({
        message: "User logged out successfully",
    });

    // next() - automatically redirect if user is successfully logged in
})