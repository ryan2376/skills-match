// src/utils/types/interviewTypes.ts
import { Request } from "express";
import { User } from "./userTypes";

// Define the interview_status enum to match the database
export enum InterviewStatus {
    pending = "pending",
    confirmed = "confirmed",
    completed = "completed",
    canceled = "canceled",
}

export interface Interview {
    id: string;
    application_id: string;
    scheduled_at: string;
    status: InterviewStatus; // Use the new enum
    created_at: string;
    updated_at: string;
}

export interface InterviewRequest extends Request {
    user?: User;
}