// middlewares/auth/roleMiddleWare.ts
import { Request, Response, NextFunction } from "express";
import { RoleRequest } from "../../utils/types/userRoles";
import { UserRole } from "../../utils/types/userTypes";
import asyncHandler from "../asyncHandler";

// Ensure user has required roles
export const roleGuard = (allowedRoles: UserRole[]) =>
    asyncHandler<void, RoleRequest>(async (req: RoleRequest, res: Response, next: NextFunction) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            res.status(403).json({ message: "Access denied: Insufficient permissions" });
            return;
        }
        next();
    });

// Specific guards for each role
export const adminGuard = roleGuard([UserRole.Admin]);      // Full app control
export const jobSeekerGuard = roleGuard([UserRole.JobSeeker]); // Job seeker actions (e.g., applying for jobs)
export const employerGuard = roleGuard([UserRole.Employer]);   // Employer actions (e.g., posting jobs)