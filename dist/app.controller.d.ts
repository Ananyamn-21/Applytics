import { AppService } from './app.service.js';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getInfo(): {
        name: string;
        description: string;
        version: string;
        endpoints: {
            auth: string;
            profile: string;
            resume: string;
            skills: string;
            preferences: string;
            platforms: string;
            jobs: string;
            applications: string;
            dashboard: string;
        };
    };
}
