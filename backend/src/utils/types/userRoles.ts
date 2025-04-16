// userRoles.ts
import { Request } from "express";
import { UserRole } from "./userTypes";

/**
 * Custom Express Request Type to include `user` with role information
 */
export interface RoleRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: UserRole;
        first_name: string;
        last_name: string;
        created_at?: Date;
        updated_at?: Date;
    };
}