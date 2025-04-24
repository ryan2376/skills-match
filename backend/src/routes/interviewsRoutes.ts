// src/routes/interviewsRoutes.ts
import express from "express";
import { scheduleInterview, getInterviews, updateInterviewStatus } from "../controllers/interviewsController";
import { protect } from "../middlewares/auth/protect";
import { employerGuard, jobSeekerGuard } from "../middlewares/auth/roleMiddleWare";

const router = express.Router();

// Schedule an interview (Employer only)
// Matches: POST /api/v1/interviews
router.post("/", protect, employerGuard, scheduleInterview);

// Update interview status (Employer or Admin)
// Matches: PUT /api/v1/interviews/:interviewId/status
router.put("/:interviewId/status", protect, employerGuard, updateInterviewStatus);

// Get interviews for an employer (Employer or Admin)
// Matches: GET /api/v1/interviews/employer/:userId
router.get("/employer/:userId", protect, getInterviews);

// Get interviews for a job seeker (Job Seeker or Admin)
// Matches: GET /api/v1/interviews/job-seeker/:userId
router.get("/job-seeker/:userId", protect, jobSeekerGuard, getInterviews);

export default router;