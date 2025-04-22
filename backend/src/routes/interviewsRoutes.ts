// src/routes/interviewsRoutes.ts
import express from "express";
import { scheduleInterview, getInterviews, updateInterviewStatus } from "../controllers/interviewsController";
import { protect } from "../middlewares/auth/protect";
import { employerGuard } from "../middlewares/auth/roleMiddleWare";

const router = express.Router();

// Schedule an interview (Employer only)
router.post("/", protect, employerGuard, scheduleInterview);

// Update interview status (Employer or Admin)
router.put("/:interviewId", protect, employerGuard, updateInterviewStatus);

// Get interviews for a user (Job Seeker, Employer, or Admin)
router.get("/:userId", protect, getInterviews);

export default router;