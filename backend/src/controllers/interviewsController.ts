// src/controllers/interviewsController.ts
import { Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import pool from "../config/db.config";
import { Interview, InterviewRequest, InterviewStatus } from "../utils/types/interviewTypes";
import { sendEmail } from "../utils/email";

// Schedule an interview (Employer only)
export const scheduleInterview = asyncHandler(async (req: InterviewRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    const { application_id, scheduled_at } = req.body;

    // Validate input
    if (!application_id || !scheduled_at) {
        return res.status(400).json({ message: "Application ID and scheduled date are required" });
    }

    // Validate UUID format for application_id
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(application_id)) {
        return res.status(400).json({ message: "Invalid application ID: must be a valid UUID" });
    }

    // Validate scheduled_at format (ISO 8601)
    const scheduledDate = new Date(scheduled_at);
    if (isNaN(scheduledDate.getTime())) {
        return res.status(400).json({ message: "Invalid scheduled date: must be a valid ISO 8601 date" });
    }

    // Check if the application exists and get the job_id
    const applicationQuery = await pool.query(
        "SELECT job_id FROM applications WHERE id = $1",
        [application_id]
    );

    if (applicationQuery.rows.length === 0) {
        return res.status(404).json({ message: "Application not found" });
    }

    const { job_id } = applicationQuery.rows[0];

    // Check if the user is the employer who posted the job (via company)
    const jobQuery = await pool.query(
        "SELECT company_id FROM jobs WHERE id = $1",
        [job_id]
    );

    if (jobQuery.rows.length === 0) {
        return res.status(404).json({ message: "Job not found" });
    }

    const { company_id } = jobQuery.rows[0];

    if (req.user.role !== "admin") {
        const companyQuery = await pool.query(
            "SELECT user_id FROM companies WHERE id = $1",
            [company_id]
        );
        if (companyQuery.rows.length === 0 || companyQuery.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ message: "Access denied: You can only schedule interviews for your own jobs" });
        }
    }

    // Insert the interview
    const result = await pool.query(
        `INSERT INTO interviews (application_id, scheduled_at, status, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING id, application_id, scheduled_at, status, created_at, updated_at`,
        [application_id, scheduled_at, InterviewStatus.pending]
    );

    const interview: Interview = result.rows[0];

    // Fetch job seeker's email and job details for the email notification
    const userQuery = await pool.query(
        `SELECT u.email, u.first_name, j.title
         FROM users u
         JOIN applications a ON a.user_id = u.id
         JOIN jobs j ON a.job_id = j.id
         WHERE a.id = $1`,
        [application_id]
    );

    if (userQuery.rows.length > 0) {
        const { email, first_name, title } = userQuery.rows[0];
        const subject = "SkillMatch: You Have a New Interview Scheduled!";
        const text = `Hi ${first_name},\n\nAn interview for the position of ${title} has been scheduled for ${scheduled_at}.\n\nBest regards,\nThe SkillMatch Team`;
        const html = `
            <h2>SkillMatch: New Interview Scheduled</h2>
            <p>Hi ${first_name},</p>
            <p>An interview for the position of <strong>${title}</strong> has been scheduled for <strong>${scheduled_at}</strong>.</p>
            <p>Best regards,<br>The SkillMatch Team</p>
        `;

        try {
            await sendEmail({ to: email, subject, text, html });
        } catch (error) {
            console.error("Failed to send email notification:", error);
            // Don't fail the request if email sending fails
        }
    }

    res.status(201).json(interview);
});

// Update interview status (Employer or Admin)
export const updateInterviewStatus = asyncHandler(async (req: InterviewRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    const interviewId = req.params.interviewId;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(interviewId)) {
        return res.status(400).json({ message: "Invalid interview ID: must be a valid UUID" });
    }

    const { status } = req.body;

    // Validate status
    if (!status || !Object.values(InterviewStatus).includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'pending', 'confirmed', 'completed', or 'canceled'" });
    }

    // Check if the interview exists and get the application_id
    const interviewQuery = await pool.query(
        "SELECT application_id FROM interviews WHERE id = $1",
        [interviewId]
    );

    if (interviewQuery.rows.length === 0) {
        return res.status(404).json({ message: "Interview not found" });
    }

    const { application_id } = interviewQuery.rows[0];

    // Check if the user is the employer who scheduled the interview (via company) or an admin
    const applicationQuery = await pool.query(
        "SELECT job_id FROM applications WHERE id = $1",
        [application_id]
    );

    if (applicationQuery.rows.length === 0) {
        return res.status(404).json({ message: "Application not found" });
    }

    const { job_id } = applicationQuery.rows[0];

    const jobQuery = await pool.query(
        "SELECT company_id FROM jobs WHERE id = $1",
        [job_id]
    );

    if (jobQuery.rows.length === 0) {
        return res.status(404).json({ message: "Job not found" });
    }

    const { company_id } = jobQuery.rows[0];

    if (req.user.role !== "admin") {
        const companyQuery = await pool.query(
            "SELECT user_id FROM companies WHERE id = $1",
            [company_id]
        );
        if (companyQuery.rows.length === 0 || companyQuery.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ message: "Access denied: You can only update interviews for your own jobs" });
        }
    }

    // Update the interview status
    const result = await pool.query(
        `UPDATE interviews
         SET status = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING id, application_id, scheduled_at, status, created_at, updated_at`,
        [status, interviewId]
    );

    const updatedInterview: Interview = result.rows[0];
    res.status(200).json(updatedInterview);
});

// Get interviews for a user (Job Seeker or Employer)
export const getInterviews = asyncHandler(async (req: InterviewRequest, res: Response) => {
    const userId = req.params.userId;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
        return res.status(400).json({ message: "Invalid user ID: must be a valid UUID" });
    }

    if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    let interviews;
    if (req.user.role === "job_seeker" && req.user.id === userId) {
        // Job seeker viewing their own interviews
        interviews = await pool.query(
            `SELECT i.id, i.application_id, i.scheduled_at, i.status, i.created_at, i.updated_at
             FROM interviews i
             JOIN applications a ON i.application_id = a.id
             WHERE a.user_id = $1
             ORDER BY i.scheduled_at DESC`,
            [userId]
        );
    } else if (req.user.role === "employer" || req.user.role === "admin") {
        // Employer viewing interviews for their jobs
        const companiesQuery = await pool.query(
            "SELECT id FROM companies WHERE user_id = $1",
            [req.user.id]
        );

        const companyIds = companiesQuery.rows.map(row => row.id);
        if (companyIds.length === 0 && req.user.role !== "admin") {
            return res.status(200).json([]); // No companies, so no interviews
        }

        if (req.user.role === "admin" && req.user.id !== userId) {
            // Admin can view any user's interviews
            interviews = await pool.query(
                `SELECT i.id, i.application_id, i.scheduled_at, i.status, i.created_at, i.updated_at
                 FROM interviews i
                 JOIN applications a ON i.application_id = a.id
                 WHERE a.user_id = $1
                 ORDER BY i.scheduled_at DESC`,
                [userId]
            );
        } else {
            // Employer viewing interviews for their jobs
            interviews = await pool.query(
                `SELECT i.id, i.application_id, i.scheduled_at, i.status, i.created_at, i.updated_at
                 FROM interviews i
                 JOIN applications a ON i.application_id = a.id
                 JOIN jobs j ON a.job_id = j.id
                 WHERE j.company_id = ANY($1)
                 ORDER BY i.scheduled_at DESC`,
                [companyIds]
            );
        }
    } else {
        return res.status(403).json({ message: "Access denied: Invalid role or user ID" });
    }

    res.status(200).json(interviews.rows);
});