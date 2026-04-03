import { JobPreference } from '../models/job-preference.model.js';
import { CreateJobPreferenceDto, UpdateJobPreferenceDto } from './dto/create-job-preference.dto.js';
export declare class JobPreferencesService {
    private readonly jobPreferenceModel;
    constructor(jobPreferenceModel: typeof JobPreference);
    findAllByUser(userId: string): Promise<JobPreference[]>;
    findActiveByUser(userId: string): Promise<JobPreference[]>;
    create(userId: string, dto: CreateJobPreferenceDto): Promise<JobPreference>;
    update(userId: string, id: string, dto: UpdateJobPreferenceDto): Promise<JobPreference>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
}
