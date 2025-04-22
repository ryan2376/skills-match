// server.ts
import express from "express";
// create all routes
import authRoutes from "./routes/authRoutes";
import usersRoutes from "./routes/usersRoutes";
import jobsRoutes from "./routes/jobsRoutes";
import applicationsRoutes from "./routes/applicationsRoutes";
import pool from "./config/db.config";
// dotenv configure
import dotenv from "dotenv";
// enable all middlewares
import cookieParser from "cookie-parser";
import cors from "cors";
import cvsRoutes from "./routes/cvsRoutes";
dotenv.config();

// instance of express

const app = express();

// load all variables
const PORT = process.env.PORT || 3000;



// NEVER FORGET
app.use(express.json()); // parses application/json
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:4200",
        methods: "GET, POST, PUT, PATCH, DELETE",
        credentials: true,
    })
);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/jobs", jobsRoutes);
app.use("/api/v1/applications", applicationsRoutes);
app.use("/api/v1/cvs", cvsRoutes);

// load more middlewares - error handlers
app.get("/test-db", async (req: express.Request, res: express.Response) => {
    try {
        const client = await pool.connect();
        const result = await client.query("SELECT NOW()");
        client.release();
        res.json({ message: "Database connection successful!", time: result.rows[0].now });
    } catch (err) {
        console.error("Database connection error:", (err as Error).stack);
        res.status(500).json({ error: "Failed to connect to database", details: (err as Error).message });
    }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

// start server
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});