import { JobPreferencesService } from './job-preferences.service.js';
import { CreateJobPreferenceDto, UpdateJobPreferenceDto } from './dto/create-job-preference.dto.js';
export declare class JobPreferencesController {
    private readonly jobPreferencesService;
    constructor(jobPreferencesService: JobPreferencesService);
    findAll(userId: string): Promise<import("../models/job-preference.model.js").JobPreference[]>;
    create(userId: string, dto: CreateJobPreferenceDto): Promise<import("../models/job-preference.model.js").JobPreference>;
    update(userId: string, id: string, dto: UpdateJobPreferenceDto): Promise<import("../models/job-preference.model.js").JobPreference>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
}
