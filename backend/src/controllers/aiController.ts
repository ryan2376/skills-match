import { Request, Response } from "express";
import { OpenAI } from "openai";
import pool from "../config/db.config";
import asyncHandler from "../middlewares/asyncHandler";
import { UserRequest } from "../utils/types/userTypes";

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Define the structure for AI query requests
interface AIQueryRequest extends UserRequest {
    body: {
        query: string;
        context?: string;
    };
}

/**
 * Process a natural language query about candidates
 */
export const processQuery = asyncHandler(async (req: AIQueryRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        // Employers and admins can query the system
        if (req.user.role !== "employer" && req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied: Only employers and admins can use the AI assistant" });
        }

        const { query } = req.body;

        if (!query || typeof query !== "string" || query.trim() === "") {
            return res.status(400).json({ message: "Query is required" });
        }

        // Step 1: Analyze the query to determine intent and extract entities
        const queryAnalysis = await analyzeQuery(query);

        // Step 2: Generate and execute database queries based on the analysis
        const dbResults = await executeDbQueries(queryAnalysis, req.user.id, req.user.role);

        // Step 3: Return the results
        res.status(200).json({
            results: dbResults,
            metadata: {
                queryAnalysis,
                resultsCount: dbResults.length,
            },
        });
    } catch (error: any) {
        console.error("Error processing AI query:", error.message, error.stack);
        res.status(500).json({ error: "Error processing your query", details: error.message });
    }
});

/**
 * Analyze a natural language query to determine its intent and extract relevant entities
 */
async function analyzeQuery(query: string) {
    const systemPrompt = `
        You are an AI assistant for a job matching platform. Analyze the following query from a recruiter or admin.
        Extract the following information:
        1. Query type: candidate_search, job_search, skill_statistics, or other
        2. Skills mentioned (if any)
        3. Experience level mentioned (if any)
        4. Location preferences (if any)
        5. Job titles mentioned (if any)
        6. Other filters

        Return the analysis as a JSON object with these fields.
    `;

    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: query },
        ],
        response_format: { type: "json_object" },
    });

    const resultText = completion.choices[0].message.content || "{}";
    return JSON.parse(resultText);
}

/**
 * Generate and execute database queries based on the query analysis
 */
async function executeDbQueries(queryAnalysis: any, userId: string, userRole: string) {
    const queryType = queryAnalysis.query_type || "other";
    const skills = queryAnalysis.skills || [];

    // Handle different query types
    switch (queryType) {
        case "candidate_search":
            return await searchCandidates(queryAnalysis);
        default:
            return [];
    }
}

/**
 * Search for candidates based on query parameters
 */
async function searchCandidates(queryAnalysis: any) {
    const skills = queryAnalysis.skills || [];

    let baseQuery = `
        SELECT 
            u.id, 
            u.first_name, 
            u.last_name, 
            u.email,
            array_agg(s.name) as skills
        FROM 
            users u
        LEFT JOIN 
            user_skills us ON u.id = us.user_id
        LEFT JOIN 
            skills s ON us.skill_id = s.id
        WHERE 
            u.role = 'job_seeker'
    `;

    const params: any[] = [];
    let conditions = [];

    // Add conditions for skills if specified
    if (skills.length > 0) {
        params.push(skills);
        conditions.push(`s.name = ANY($${params.length})`);
    }

    if (conditions.length > 0) {
        baseQuery += " AND " + conditions.join(" AND ");
    }

    baseQuery += " GROUP BY u.id, u.first_name, u.last_name, u.email";

    const result = await pool.query(baseQuery, params);
    return result.rows;
}