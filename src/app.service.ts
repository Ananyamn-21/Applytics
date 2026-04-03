import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'Early Edge',
      description: 'AI-powered auto job application platform',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth (register, login)',
        profile: '/api/users/profile',
        resume: '/api/users/resume',
        skills: '/api/skills',
        preferences: '/api/job-preferences',
        platforms: '/api/platform-accounts',
        jobs: '/api/jobs',
        applications: '/api/applications',
        dashboard: '/api/dashboard',
      },
    };
  }
}
