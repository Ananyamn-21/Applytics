"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
let AiService = AiService_1 = class AiService {
    configService;
    logger = new common_1.Logger(AiService_1.name);
    genAI;
    model;
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('gemini.apiKey');
        if (!apiKey) {
            this.logger.warn('GEMINI_API_KEY not configured - AI features will not work');
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey || '');
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }
    async tailorResume(originalResumeText, jobTitle, jobDescription, skills) {
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
                        type: 'object',
                        properties: {
                            summary: {
                                type: 'string',
                                description: 'A professional professional summary tailored to the job',
                            },
                            skills: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Array of relevant skills formatted nicely',
                            },
                            experiences: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        company: { type: 'string' },
                                        role: { type: 'string' },
                                        duration: { type: 'string' },
                                        bullets: {
                                            type: 'array',
                                            items: { type: 'string' },
                                        },
                                    },
                                    required: ['company', 'role', 'duration', 'bullets'],
                                },
                                description: 'Array of work experiences, tailored for the role.',
                            },
                            education: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        institution: { type: 'string' },
                                        degree: { type: 'string' },
                                        year: { type: 'string' },
                                    },
                                    required: ['institution', 'degree', 'year'],
                                },
                            },
                            highlights: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Array of strings describing what you emphasized/changed',
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
            const text = result.response.text();
            return JSON.parse(text);
        }
        catch (error) {
            this.logger.error('Error tailoring resume with Gemini', error instanceof Error ? error.stack : error);
            return null;
        }
    }
    async scoreJobMatch(resumeText, skills, preferences, jobTitle, jobDescription) {
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
                        type: 'object',
                        properties: {
                            score: {
                                type: 'number',
                                description: 'number 0-100 indicating match quality',
                            },
                            reasons: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'array of strings explaining the score',
                            },
                        },
                        required: ['score', 'reasons'],
                    },
                },
            });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const parsed = JSON.parse(text);
            return {
                score: parsed.score || 0,
                reasons: parsed.reasons || [],
            };
        }
        catch (error) {
            this.logger.error('Error scoring job match with Gemini', error instanceof Error ? error.stack : error);
            return {
                score: 0,
                reasons: ['Error analyzing job match'],
            };
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map