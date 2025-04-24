// routes/applicationsRoutes.ts
import express from "express";
import {
    applyForJob,
    getApplicationsForJob,
    updateApplicationStatus,
    getApplicationsByJobSeeker,
    getApplicationById, // Import the new method
} from "../controllers/applicationsController";
import { protect } from "../middlewares/auth/protect";
import { jobSeekerGuard } from "../middlewares/auth/roleMiddleWare";

const router = express.Router();

// Apply for a job (Job Seeker only)
// Matches: POST /api/v1/jobs/:jobId/applications
router.post("/jobs/:jobId/applications", protect, jobSeekerGuard, applyForJob);

// Get all applications for a job (Employer or Admin)
// Matches: GET /api/v1/jobs/:jobId/applications
router.get("/jobs/:jobId/applications", protect, getApplicationsForJob);

// Update application status (Employer or Admin)
// Matches: PUT /api/v1/applications/:applicationId/status
router.put("/:applicationId/status", protect, updateApplicationStatus);

// Get all applications by a job seeker (Job Seeker only)
// Matches: GET /api/v1/job-seeker (unchanged)
router.get("/job-seeker", protect, jobSeekerGuard, getApplicationsByJobSeeker);

// Get a single application by ID (Employer or Admin)
// Matches: GET /api/v1/applications/:applicationId
router.get("/:applicationId", protect, getApplicationById);

export default router;