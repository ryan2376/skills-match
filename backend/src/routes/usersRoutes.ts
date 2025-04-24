// routes/usersRoutes.ts
import express from "express";
import { getUsers, getUserById, updateUser, deleteUser, addUserSkills } from "../controllers/usersController";
import { protect } from "../middlewares/auth/protect";
import { adminGuard } from "../middlewares/auth/roleMiddleWare";

const router = express.Router();

// Get all users (Admin only)
router.get("/", protect, adminGuard, getUsers);

// Get a single user by ID (Admin or self)
router.get("/:id", protect, getUserById);

// Update a user (Admin or self)
router.put("/:id", protect, updateUser);

// Delete a user (Admin only)
router.delete("/:id", protect, adminGuard, deleteUser);

// Add skills to the authenticated job seeker's profile
router.post("/skills", protect, addUserSkills);

export default router;