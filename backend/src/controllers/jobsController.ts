// src/controllers/jobsController.ts
import pool from "../config/db.config";
import asyncHandler from "../middlewares/asyncHandler";
import { Request, Response } from "express";
import { JobRequest, JobStatus } from "../utils/types/jobTypes";

// Get total jobs (Admin only)
export const getTotalJobs = asyncHandler(async (req: JobRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    const result = await pool.query("SELECT COUNT(*) AS total FROM jobs");
    const total = parseInt(result.rows[0].total, 10);
    res.status(200).json({ total });
});

// Create a new job (Employer only)
export const createJob = asyncHandler(async (req: JobRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const { title, description, location, status, skills } = req.body;

        if (!title || !description || !location) {
            res.status(400).json({ message: "Title, description, and location are required" });
            return;
        }

        if (location.length > 100) {
            res.status(400).json({ message: "Location must be 100 characters or less" });
            return;
        }

        const jobStatus = status || JobStatus.open;
        if (!Object.values(JobStatus).includes(jobStatus)) {
            res.status(400).json({ message: "Invalid status. Must be 'open' or 'closed'" });
            return;
        }

        if (skills && (!Array.isArray(skills) || skills.some((skill: any) => typeof skill !== "string"))) {
            res.status(400).json({ message: "Skills must be an array of strings" });
            return;
        }

        const userQuery = await pool.query(
            "SELECT company_id FROM users WHERE id = $1",
            [req.user.id]
        );

        if (userQuery.rows.length === 0 || !userQuery.rows[0].company_id) {
            res.status(403).json({ message: "No company associated with this employer" });
            return;
        }

        const company_id = userQuery.rows[0].company_id;

        const jobResult = await pool.query(
            `INSERT INTO jobs (company_id, title, description, location, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
             RETURNING id, company_id, title, description, location, status, created_at, updated_at`,
            [company_id, title, description, location, jobStatus]
        );

        const newJob = jobResult.rows[0];

        if (skills && skills.length > 0) {
            for (const skill of skills) {
                let skillResult = await pool.query(
                    "SELECT id FROM skills WHERE name = $1",
                    [skill]
                );

                let skillId;
                if (skillResult.rows.length === 0) {
                    const insertSkillResult = await pool.query(
                        "INSERT INTO skills (name, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING id",
                        [skill]
                    );
                    skillId = insertSkillResult.rows[0].id;
                } else {
                    skillId = skillResult.rows[0].id;
                }

                await pool.query(
                    "INSERT INTO job_skills (job_id, skill_id, created_at, updated_at) VALUES ($1::uuid, $2, NOW(), NOW()) ON CONFLICT DO NOTHING",
                    [newJob.id, skillId]
                );
            }
        }

        res.status(201).json(newJob);
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

        if (!title || !description || !location) {
            res.status(400).json({ message: "Title, description, and location are required" });
            return;
        }

        if (location.length > 100) {
            res.status(400).json({ message: "Location must be 100 characters or less" });
            return;
        }

        let newStatus = status;
        if (newStatus && !Object.values(JobStatus).includes(newStatus)) {
            res.status(400).json({ message: "Invalid status. Must be 'open' or 'closed'" });
            return;
        }

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

        if (req.user.role !== "admin" && req.user.id !== employerId) {
            res.status(403).json({ message: "Access denied: You can only view your own jobs" });
            return;
        }

        const companiesQuery = await pool.query(
            "SELECT id FROM companies WHERE user_id = $1",
            [employerId]
        );

        const companyIds = companiesQuery.rows.map(row => row.id);
        if (companyIds.length === 0) {
            res.status(200).json([]);
            return;
        }

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

// Get recommended jobs for the authenticated job seeker
export const getRecommendedJobs = asyncHandler(async (req: JobRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        if (req.user.role !== "job_seeker") {
            res.status(403).json({ message: "Access denied: Only job seekers can access recommended jobs" });
            return;
        }

        const userSkillsQuery = await pool.query(
            `SELECT skill_id
             FROM user_skills
             WHERE user_id = $1`,
            [req.user.id]
        );

        const userSkillIds = userSkillsQuery.rows.map(row => row.skill_id);

        if (userSkillIds.length === 0) {
            res.status(200).json([]);
            return;
        }

        const jobsQuery = await pool.query(
            `SELECT j.id, j.company_id, j.title, j.description, j.location, j.status, j.created_at, j.updated_at
             FROM jobs j
             JOIN job_skills js ON j.id = js.job_id
             WHERE js.skill_id = ANY($1::int[])
               AND j.status = 'open'
             GROUP BY j.id
             ORDER BY j.created_at DESC`,
            [userSkillIds]
        );

        res.status(200).json(jobsQuery.rows);
    } catch (error) {
        console.error("Error fetching recommended jobs:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});