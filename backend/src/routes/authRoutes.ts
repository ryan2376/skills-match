// authRoutes.ts
import express from 'express';
import { loginUser, logOutUser, registerUser } from '../controllers/authController';

const router = express.Router();

// public routes
router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', logOutUser)

export default router;