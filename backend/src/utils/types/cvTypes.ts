// utils/types/cvTypes.ts
import { Request } from "express";
import { User } from "./userTypes";

export interface CV {
    id: string;
    user_id: string;
    file_url: string;
    created_at: string;
    updated_at: string;
}

export interface CVRequest extends Request {
    user?: User;
}