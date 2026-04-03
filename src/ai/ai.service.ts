/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly model;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    if (!apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY not configured - AI features will not work',
      );
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
    // Using Gemini 2.5 Flash - the free model
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async tailorResume(
    originalResumeText: string,
    jobTitle: string,
    jobDescription: string,
    skills: string[],
  ): Promise<TailoredResume | null> {
    const prompt = `You are an expert resume writer. Your job is to tailor a resume for a specific job posting.

IMPORTANT RULES:
- NEVER add fake information, skills, or experiences that don't exist in the original resume
- Only REORDER, EMPHASIZE, and REPHRASE existing content to better match the job
- Highlight the most relevant skills and experiences for this specific role
- Use keywords from the job description where they naturally fit with existing experience
- Parse the original resume text and split it accurately into the structured JSON format provided.

Original Resume:
${originalResumeText}

Job Title: ${jobTitle}
Job Description: ${jobDescription}
User Skills: ${skills.join(', ')}`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object' as any,
            properties: {
              summary: {
                type: 'string' as any,
                description:
                  'A professional professional summary tailored to the job',
              },
              skills: {
                type: 'array' as any,
                items: { type: 'string' as any },
                description: 'Array of relevant skills formatted nicely',
              },
              experiences: {
                type: 'array' as any,
                items: {
                  type: 'object' as any,
                  properties: {
                    company: { type: 'string' as any },
                    role: { type: 'string' as any },
                    duration: { type: 'string' as any },
                    bullets: {
                      type: 'array' as any,
                      items: { type: 'string' as any },
                    },
                  },
                  required: ['company', 'role', 'duration', 'bullets'],
                },
                description:
                  'Array of work experiences, tailored for the role.',
              },
              education: {
                type: 'array' as any,
                items: {
                  type: 'object' as any,
                  properties: {
                    institution: { type: 'string' as any },
                    degree: { type: 'string' as any },
                    year: { type: 'string' as any },
                  },
                  required: ['institution', 'degree', 'year'],
                },
              },
              highlights: {
                type: 'array' as any,
                items: { type: 'string' as any },
                description:
                  'Array of strings describing what you emphasized/changed',
              },
            },
            required: [
              'summary',
              'skills',
              'experiences',
              'education',
              'highlights',
            ],
          },
        },
      });

      const result = await model.generateContent(prompt);
      const text: string = result.response.text();
      return JSON.parse(text) as TailoredResume;
    } catch (error) {
      this.logger.error(
        'Error tailoring resume with Gemini',
        error instanceof Error ? error.stack : error,
      );
      return null;
    }
  }

  async scoreJobMatch(
    resumeText: string,
    skills: string[],
    preferences: { role: string; keywords: string[] },
    jobTitle: string,
    jobDescription: string,
  ): Promise<JobMatchScore> {
    const prompt = `You evaluate how well a job matches a candidate's profile.

Candidate Resume Summary:
${resumeText?.substring(0, 2000)}

Candidate Skills: ${skills.join(', ')}
Preferred Role: ${preferences.role}
Preferred Keywords: ${preferences.keywords.join(', ')}

Job Title: ${jobTitle}
Job Description: ${jobDescription?.substring(0, 2000)}`;

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object' as any,
            properties: {
              score: {
                type: 'number' as any,
                description: 'number 0-100 indicating match quality',
              },
              reasons: {
                type: 'array' as any,
                items: { type: 'string' as any },
                description: 'array of strings explaining the score',
              },
            },
            required: ['score', 'reasons'],
          },
        },
      });

      const result = await model.generateContent(prompt);

      const text: string = result.response.text();

      const parsed = JSON.parse(text) as JobMatchScore;
      return {
        score: parsed.score || 0,
        reasons: parsed.reasons || [],
      };
    } catch (error) {
      this.logger.error(
        'Error scoring job match with Gemini',
        error instanceof Error ? error.stack : error,
      );
      return {
        score: 0,
        reasons: ['Error analyzing job match'],
      };
    }
  }
}
