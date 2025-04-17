// controllers/applicationsController.ts
import pool from "../config/db.config";
import asyncHandler from "../middlewares/asyncHandler";
import { Request, Response, NextFunction } from "express";
import { ApplicationRequest, ApplicationStatus } from "../utils/types/applicationTypes";

// Apply for a job (Job Seeker only)
export const applyForJob = asyncHandler(async (req: ApplicationRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const jobId = req.params.jobId;
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId)) {
            res.status(400).json({ message: "Invalid job ID: must be a valid UUID" });
            return;
        }

        // Check if the job exists and is open
        const jobQuery = await pool.query(
            "SELECT id, status FROM jobs WHERE id = $1",
            [jobId]
        );

        if (jobQuery.rows.length === 0) {
            res.status(404).json({ message: "Job not found" });
            return;
        }

        const job = jobQuery.rows[0];
        if (job.status !== "open") {
            res.status(400).json({ message: "Cannot apply for a closed job" });
            return;
        }

        // Check if the user has already applied
        const applicationQuery = await pool.query(
            "SELECT id FROM applications WHERE user_id = $1 AND job_id = $2",
            [req.user.id, jobId]
        );

        if (applicationQuery.rows.length > 0) {
            res.status(400).json({ message: "You have already applied for this job" });
            return;
        }

        // Create the application
        const result = await pool.query(
            `INSERT INTO applications (user_id, job_id, status, applied_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id, user_id, job_id, status, applied_at, updated_at`,
            [req.user.id, jobId, ApplicationStatus.pending]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error applying for job:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get all applications for a job (Employer who posted the job or Admin)
export const getApplicationsForJob = asyncHandler(async (req: ApplicationRequest, res: Response) => {
    try {
        const jobId = req.params.jobId;
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
            "SELECT company_id FROM jobs WHERE id = $1",
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
                res.status(403).json({ message: "Access denied: You can only view applications for your own jobs" });
                return;
            }
        }

        // Get all applications for the job
        const result = await pool.query(
            `SELECT id, user_id, job_id, status, applied_at, updated_at
       FROM applications
       WHERE job_id = $1
       ORDER BY applied_at DESC`,
            [jobId]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Update application status (Employer who posted the job or Admin)
export const updateApplicationStatus = asyncHandler(async (req: ApplicationRequest, res: Response) => {
    try {
        const applicationId = req.params.applicationId;
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(applicationId)) {
            res.status(400).json({ message: "Invalid application ID: must be a valid UUID" });
            return;
        }

        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        // Check if the application exists and get the job_id
        const applicationQuery = await pool.query(
            "SELECT job_id FROM applications WHERE id = $1",
            [applicationId]
        );

        if (applicationQuery.rows.length === 0) {
            res.status(404).json({ message: "Application not found" });
            return;
        }

        const application = applicationQuery.rows[0];

        // Check if the user is the employer who posted the job (via company) or an admin
        const jobQuery = await pool.query(
            "SELECT company_id FROM jobs WHERE id = $1",
            [application.job_id]
        );

        if (jobQuery.rows.length === 0) {
            res.status(404).json({ message: "Job not found" });
            return;
        }

        const job = jobQuery.rows[0];

        if (req.user.role !== "admin") {
            const companyQuery = await pool.query(
                "SELECT user_id FROM companies WHERE id = $1",
                [job.company_id]
            );
            if (companyQuery.rows.length === 0 || companyQuery.rows[0].user_id !== req.user.id) {
                res.status(403).json({ message: "Access denied: You can only update applications for your own jobs" });
                return;
            }
        }

        const { status } = req.body;

        // Validate status
        if (!status || !Object.values(ApplicationStatus).includes(status)) {
            res.status(400).json({ message: "Invalid status. Must be 'pending', 'accepted', or 'rejected'" });
            return;
        }

        // Update the application
        const result = await pool.query(
            `UPDATE applications
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, user_id, job_id, status, applied_at, updated_at`,
            [status, applicationId]
        );

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error updating application status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get all applications by a job seeker (Job Seeker only)
export const getApplicationsByJobSeeker = asyncHandler(async (req: ApplicationRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        // Get all applications by the job seeker
        const result = await pool.query(
            `SELECT id, user_id, job_id, status, applied_at, updated_at
            FROM applications
            WHERE user_id = $1
            ORDER BY applied_at DESC`,
            [req.user.id]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});