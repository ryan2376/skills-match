// src/routes/jobsRoutes.ts
import express from "express";
import { createJob, getJobs, getJobById, updateJob, deleteJob, getJobsByEmployer, getRecommendedJobs, getTotalJobs } from "../controllers/jobsController";
import { protect } from "../middlewares/auth/protect";
import { employerGuard, adminGuard } from "../middlewares/auth/roleMiddleWare";

const router = express.Router();

// Get total jobs (Admin only)
// Matches: GET /api/v1/jobs/total
router.get("/total", protect, adminGuard, getTotalJobs);

// Create a new job (Employer only)
// Matches: POST /api/v1/jobs
router.post("/", protect, employerGuard, createJob);

// Get all jobs (Public)
// Matches: GET /api/v1/jobs
router.get("/", getJobs);

// Get a specific job by ID (Public)
// Matches: GET /api/v1/jobs/:id
router.get("/:id", getJobById);

// Update a job (Employer or Admin)
// Matches: PUT /api/v1/jobs/:id
router.put("/:id", protect, updateJob);

// Delete a job (Employer or Admin)
// Matches: DELETE /api/v1/jobs/:id
router.delete("/:id", protect, deleteJob);

// Get all jobs by a specific employer (Employer or Admin)
// Matches: GET /api/v1/jobs/employer/:employerId
router.get("/employer/:employerId", protect, getJobsByEmployer);

// Get recommended jobs for the authenticated job seeker
// Matches: GET /api/v1/jobs/recommended
router.get("/recommended", protect, getRecommendedJobs);

export default router;