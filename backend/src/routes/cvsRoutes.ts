// routes/cvsRoutes.ts
import express from "express";
import { uploadCV, getCV } from "../controllers/cvsController";
import { protect } from "../middlewares/auth/protect";
import { jobSeekerGuard } from "../middlewares/auth/roleMiddleWare";

const router = express.Router();

// Upload a CV (Job Seeker only)
router.post("/", protect, jobSeekerGuard, uploadCV);

// Get a user's CV (Job Seeker, Employer, or Admin)
router.get("/:userId", protect, getCV);

export default router;