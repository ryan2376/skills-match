// routes/jobsRoutes.ts
import express from "express";
import {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    getJobsByEmployer,
    getRecommendedJobs,
} from "../controllers/jobsController";
import { protect } from "../middlewares/auth/protect";
import { employerGuard, adminGuard } from "../middlewares/auth/roleMiddleWare";

const router = express.Router();

// Create a new job (Employer only)
router.post("/", protect, employerGuard, createJob);

// Get all jobs (Public)
router.get("/", getJobs);

// Get a specific job by ID (Public)
router.get("/:id", getJobById);

// Update a job (Employer who posted it or Admin)
router.put("/:id", protect, updateJob);

// Delete a job (Employer who posted it or Admin)
router.delete("/:id", protect, deleteJob);

// Get all jobs by a specific employer (Employer or Admin)
router.get("/employer/:employerId", protect, getJobsByEmployer);

// Get recommended jobs for the authenticated job seeker
router.get("/recommended", protect, getRecommendedJobs);

export default router;