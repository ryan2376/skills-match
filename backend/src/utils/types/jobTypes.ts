// utils/types/jobTypes.ts
import { Request } from "express";
import { User } from "./userTypes";

// Define the job_status enum
export enum JobStatus {
    open = "open",
    closed = "closed",
    draft = "draft",
}

export interface Job {
    id: string; // UUID
    company_id: string; // UUID of the company
    title: string;
    description: string;
    location: string;
    status: JobStatus;
    created_at?: Date;
    updated_at?: Date;
}

export interface JobRequest extends Request {
    job?: Job;
    user?: User; // From protect middleware
}