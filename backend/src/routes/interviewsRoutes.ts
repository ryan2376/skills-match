// src/routes/interviewsRoutes.ts
import express from "express";
import { scheduleInterview, getInterviews } from "../controllers/interviewsController";
import { protect } from "../middlewares/auth/protect";
import { employerGuard } from "../middlewares/auth/roleMiddleWare";

const router = express.Router();

// Schedule an interview (Employer only)
router.post("/", protect, employerGuard, scheduleInterview);

// Get interviews for a user (Job Seeker, Employer, or Admin)
router.get("/:userId", protect, getInterviews);

export default router;