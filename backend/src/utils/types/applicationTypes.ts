// src/utils/types/applicationTypes.ts
import { Request } from "express";
import { User } from "./userTypes";
import { Job } from "./jobTypes";

// Define the application_status enum to match the database
export enum ApplicationStatus {
    submitted = "submitted",
    under_review = "under_review",
    interview = "interview",
    accepted = "accepted",
    rejected = "rejected",
}

export interface Application {
    id: string; // UUID
    user_id: string; // UUID of the job seeker
    job_id: string; // UUID of the job
    status: ApplicationStatus;
    applied_at?: Date;
    updated_at?: Date;
}

export interface ApplicationRequest extends Request {
    application?: Application;
    user?: User;
    job?: Job;
}