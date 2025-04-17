// controllers/jobsController.ts
import pool from "../config/db.config";
import asyncHandler from "../middlewares/asyncHandler";
import { Request, Response, NextFunction } from "express";
import { JobRequest, JobStatus } from "../utils/types/jobTypes";

// Create a new job (Employer only)
export const createJob = asyncHandler(async (req: JobRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { title, description, location, company_id, status } = req.body;

        // Validate input
        if (!title || !description || !location || !company_id) {
            res.status(400).json({ message: "Title, description, location, and company_id are required" });
            return;
        }

        // Validate location length
        if (location.length > 100) {
            res.status(400).json({ message: "Location must be 100 characters or less" });
            return;
        }

        // Validate status if provided
        const jobStatus = status || JobStatus.open;
        if (!Object.values(JobStatus).includes(jobStatus)) {
            res.status(400).json({ message: "Invalid status. Must be 'open' or 'closed'" });
            return;
        }

        // Check if the company exists and belongs to the user
        const companyQuery = await pool.query(
            "SELECT id FROM companies WHERE id = $1 AND user_id = $2",
            [company_id, req.user.id]
        );

        if (companyQuery.rows.length === 0) {
            res.status(403).json({ message: "Company not found or you do not have permission to post jobs for this company" });
            return;
        }

        // Insert the new job
        const result = await pool.query(
            `INSERT INTO jobs (company_id, title, description, location, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, company_id, title, description, location, status, created_at, updated_at`,
            [company_id, title, description, location, jobStatus]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating job:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get all jobs (Public)
export const getJobs = asyncHandler(async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT id, company_id, title, description, location, status, created_at, updated_at
       FROM jobs
       ORDER BY created_at DESC`
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get a specific job by ID (Public)
export const getJobById = asyncHandler(async (req: Request, res: Response) => {
    try {
        const jobId = req.params.id;
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId)) {
            res.status(400).json({ message: "Invalid job ID: must be a valid UUID" });
            return;
        }

        const result = await pool.query(
            `SELECT id, company_id, title, description, location, status, created_at, updated_at
       FROM jobs
       WHERE id = $1`,
            [jobId]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ message: "Job not found" });
            return;
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching job:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Update a job (Employer who posted it or Admin)
export const updateJob = asyncHandler(async (req: JobRequest, res: Response) => {
    try {
        const jobId = req.params.id;
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId)) {
            res.status(400).json({ message: "Invalid job ID: must be a valid UUID" });
            return;
        }

        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        // Check if the job exists and get the company_id
        const jobQuery = await pool.query(
            `SELECT company_id
       FROM jobs
       WHERE id = $1`,
            [jobId]
        );

        if (jobQuery.rows.length === 0) {
            res.status(404).json({ message: "Job not found" });
            return;
        }

        const job = jobQuery.rows[0];

        // Check if the user is the employer who posted the job (via company) or an admin
        if (req.user.role !== "admin") {
            const companyQuery = await pool.query(
                "SELECT user_id FROM companies WHERE id = $1",
                [job.company_id]
            );
            if (companyQuery.rows.length === 0 || companyQuery.rows[0].user_id !== req.user.id) {
                res.status(403).json({ message: "Access denied: You can only update your own jobs" });
                return;
            }
        }

        const { title, description, location, status } = req.body;

        // Validate input
        if (!title || !description || !location) {
            res.status(400).json({ message: "Title, description, and location are required" });
            return;
        }

        // Validate location length
        if (location.length > 100) {
            res.status(400).json({ message: "Location must be 100 characters or less" });
            return;
        }

        // Validate status if provided
        let newStatus = status;
        if (newStatus && !Object.values(JobStatus).includes(newStatus)) {
            res.status(400).json({ message: "Invalid status. Must be 'open' or 'closed'" });
            return;
        }

        // Update the job
        const result = await pool.query(
            `UPDATE jobs
       SET title = $1, description = $2, location = $3, status = COALESCE($4, status), updated_at = NOW()
       WHERE id = $5
       RETURNING id, company_id, title, description, location, status, created_at, updated_at`,
            [title, description, location, newStatus, jobId]
        );

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error updating job:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Delete a job (Employer who posted it or Admin)
export const deleteJob = asyncHandler(async (req: JobRequest, res: Response) => {
    try {
        const jobId = req.params.id;
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId)) {
            res.status(400).json({ message: "Invalid job ID: must be a valid UUID" });
            return;
        }

        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        // Check if the job exists and get the company_id
        const jobQuery = await pool.query(
            `SELECT company_id
            FROM jobs
            WHERE id = $1`,
            [jobId]
        );

        if (jobQuery.rows.length === 0) {
            res.status(404).json({ message: "Job not found" });
            return;
        }

        const job = jobQuery.rows[0];

        // Check if the user is the employer who posted the job (via company) or an admin
        if (req.user.role !== "admin") {
            const companyQuery = await pool.query(
                "SELECT user_id FROM companies WHERE id = $1",
                [job.company_id]
            );
            if (companyQuery.rows.length === 0 || companyQuery.rows[0].user_id !== req.user.id) {
                res.status(403).json({ message: "Access denied: You can only delete your own jobs" });
                return;
            }
        }

        // Delete the job
        await pool.query("DELETE FROM jobs WHERE id = $1", [jobId]);

        res.status(200).json({ message: "Job deleted successfully" });
    } catch (error) {
        console.error("Error deleting job:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get all jobs by a specific employer (Employer or Admin)
export const getJobsByEmployer = asyncHandler(async (req: JobRequest, res: Response) => {
    try {
        const employerId = req.params.employerId;
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(employerId)) {
            res.status(400).json({ message: "Invalid employer ID: must be a valid UUID" });
            return;
        }

        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        // Check if the user is the employer or an admin
        if (req.user.role !== "admin" && req.user.id !== employerId) {
            res.status(403).json({ message: "Access denied: You can only view your own jobs" });
            return;
        }

        // Find all companies owned by the employer
        const companiesQuery = await pool.query(
            "SELECT id FROM companies WHERE user_id = $1",
            [employerId]
        );

        const companyIds = companiesQuery.rows.map(row => row.id);
        if (companyIds.length === 0) {
            res.status(200).json([]); // No companies, so no jobs
            return;
        }

        // Find all jobs posted by those companies
        const result = await pool.query(
            `SELECT id, company_id, title, description, location, status, created_at, updated_at
            FROM jobs
            WHERE company_id = ANY($1)
            ORDER BY created_at DESC`,
            [companyIds]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching jobs by employer:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});