// server.ts
// dotenv configure
// instance of express
// load all variables
// enable all middlewares
// create all routes
// load more middlewares - error handlers
// start server

import express from "express";
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRoutes from "./routes/authRoutes";
import usersRoutes from "./routes/usersRoutes";
import bookRoutes from "./routes/bookRoutes";
import bookCopyRoutes from "./routes/bookCopyRoutes";
import borrowRoutes from "./routes/borrowRoutes";
import pool from "./config/db.config";

dotenv.config()


const app = express();

// NEVER FORGET
app.use(express.json()) //parses  application/json

// 
app.use(cookieParser())

app.use(cors({
    origin: 'http://localhost:4200',
    methods: "GET, POST, PUT, PATCH, DELETE",
    credentials: true
}))


// routes
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/users", usersRoutes)
app.use("/api/v1/books", bookRoutes)
app.use("/api/v1/bookCopy", bookCopyRoutes)
app.use("/api/v1/borrow", borrowRoutes)
// Middlewares for error handlers

app.get('/test-db', async (req: express.Request, res: express.Response) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        res.json({ message: 'Database connection successful!', time: result.rows[0].now });
    } catch (err) {
        console.error('Database connection error:', (err as Error).stack);
        res.status(500).json({ error: 'Failed to connect to database', details: (err as Error).message });
    }
});
// start the server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
});