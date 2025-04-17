// routes/applicationsRoutes.ts
import express from "express";
import {
    applyForJob,
    getApplicationsForJob,
    updateApplicationStatus,
    getApplicationsByJobSeeker,
} from "../controllers/applicationsController";
import { protect } from "../middlewares/auth/protect";
import { jobSeekerGuard } from "../middlewares/auth/roleMiddleWare";

const router = express.Router();

// Apply for a job (Job Seeker only)
router.post("/apply/:jobId", protect, jobSeekerGuard, applyForJob);

// Get all applications for a job (Employer or Admin)
router.get("/job/:jobId", protect, getApplicationsForJob);

// Update application status (Employer or Admin)
router.put("/:applicationId", protect, updateApplicationStatus);

// Get all applications by a job seeker (Job Seeker only)
router.get("/job-seeker", protect, jobSeekerGuard, getApplicationsByJobSeeker);

export default router;