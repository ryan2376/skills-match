// src/routes/usersRoutes.ts
import express from "express";
import { getUsers, getUserById, updateUser, deleteUser, addUserSkills, getTotalUsers, getTotalEmployers} from "../controllers/usersController";
import { protect } from "../middlewares/auth/protect";
import { adminGuard } from "../middlewares/auth/roleMiddleWare";

const router = express.Router();

// Get total users (Admin only)
// Matches: GET /api/v1/users/total
router.get("/total", protect, adminGuard, getTotalUsers);

// Get active employers (Admin only)
// Matches: GET /api/v1/users/employers/active
router.get("/employers/total", protect, adminGuard, getTotalEmployers);

// Get all users (Admin only)
// Matches: GET /api/v1/users
router.get("/", protect, adminGuard, getUsers);

// Get a single user by ID (Admin or self)
// Matches: GET /api/v1/users/:id
router.get("/:id", protect, getUserById);

// Update a user (Admin or self)
// Matches: PUT /api/v1/users/:id
router.put("/:id", protect, updateUser);

// Delete a user (Admin only)
// Matches: DELETE /api/v1/users/:id
router.delete("/:id", protect, adminGuard, deleteUser);

// Add skills to the authenticated job seeker's profile
// Matches: POST /api/v1/users/skills
router.post("/skills", protect, addUserSkills);

export default router;