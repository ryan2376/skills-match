import express from "express";
import { processQuery } from "../controllers/aiController";
import { protect } from "../middlewares/auth/protect";

const router = express.Router();

// Process a natural language query about candidates (Employer or Admin)
router.post("/query", protect, processQuery);

export default router;