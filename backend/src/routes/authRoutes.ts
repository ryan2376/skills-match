// authRoutes.ts
import express from "express";
import { loginUser, logOutUser, registerUser, refreshToken } from "../controllers/authController";

const router = express.Router();

router.post("/register",registerUser);
router.post("/login", loginUser);
router.post("/logout", logOutUser);
router.post("/refresh-token", refreshToken);

export default router;