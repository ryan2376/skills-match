// roleMiddleWare.ts
import { Request, Response, NextFunction } from "express";
import { RoleRequest } from "../../utils/types/userRoles";
import asyncHandler  from "../asyncHandler";


//ensure user has required roles 
export const roleGuard = (allowedRoles: string[]) =>
    asyncHandler<void, RoleRequest>(async (req:RoleRequest, res:Response, next:NextFunction) => {
        if (!req.user || !allowedRoles.includes(req.user.role_name)) {
            res.status(403).json({ message: "Access denied: Insufficient permissions" });
            return;
        }
        next();
    });



// Specific guards
export const adminGuard = roleGuard(["Admin"]);         // Full app control
export const librarianGuard = roleGuard(["Librarian"]); // Book creation & management
export const borrowerGuard = roleGuard(["Borrower"]);   // Borrower-only actions

