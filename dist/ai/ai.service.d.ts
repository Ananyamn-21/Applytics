import { ConfigService } from '@nestjs/config';
export interface TailoredResume {
    summary: string;
    skills: string[];
    experiences: {
        company: string;
        role: string;
        duration: string;
        bullets: string[];
    }[];
    education: {
        institution: string;
        degree: string;
        year: string;
    }[];
    highlights: string[];
}
export interface JobMatchScore {
    score: number;
    reasons: string[];
}
export declare class AiService {
    private readonly configService;
    private readonly logger;
    private readonly genAI;
    private readonly model;
    constructor(configService: ConfigService);
    tailorResume(originalResumeText: string, jobTitle: string, jobDescription: string, skills: string[]): Promise<TailoredResume | null>;
    scoreJobMatch(resumeText: string, skills: string[], preferences: {
        role: string;
        keywords: string[];
    }, jobTitle: string, jobDescription: string): Promise<JobMatchScore>;
}
