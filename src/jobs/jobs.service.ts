import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Job, JobPlatform } from '../models/job.model.js';

export interface CreateJobData {
  externalId: string;
  platform: JobPlatform;
  title: string;
  company: string;
  location?: string;
  description?: string;
  jobUrl: string;
  postedAt: Date;
  applicantCount?: number;
  salary?: string;
  jobType?: string;
  isRemote?: boolean;
}

@Injectable()
export class JobsService {
  constructor(@InjectModel(Job) private readonly jobModel: typeof Job) {}

  async upsertJob(data: CreateJobData): Promise<Job> {
    const [job] = await this.jobModel.upsert(data as unknown as Partial<Job>, {
      conflictFields: ['externalId', 'platform'],
    });
    return job;
  }

  async findRecentJobs(filters: {
    maxAgeMinutes?: number;
    maxApplicants?: number;
    keywords?: string[];
    location?: string;
    platform?: JobPlatform;
  }) {
    const where: Record<string, unknown> = {};

    if (filters.maxAgeMinutes) {
      const cutoff = new Date(Date.now() - filters.maxAgeMinutes * 60 * 1000);
      where.postedAt = { [Op.gte]: cutoff };
    }

    if (filters.maxApplicants) {
      where.applicantCount = {
        [Op.or]: [{ [Op.lte]: filters.maxApplicants }, { [Op.is]: null }],
      };
    }

    if (filters.platform) {
      where.platform = filters.platform;
    }

    if (filters.keywords && filters.keywords.length > 0) {
      where.title = {
        [Op.or]: filters.keywords.map((kw) => ({
          [Op.iLike]: `%${kw}%`,
        })),
      };
    }

    if (filters.location) {
      where.location = { [Op.iLike]: `%${filters.location}%` };
    }

    return this.jobModel.findAll({
      where,
      order: [['postedAt', 'DESC']],
      limit: 50,
    });
  }

  async findById(id: string) {
    return this.jobModel.findByPk(id);
  }

  async findAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows, count } = await this.jobModel.findAndCountAll({
      order: [['postedAt', 'DESC']],
      limit,
      offset,
    });
    return { jobs: rows, total: count, page, limit };
  }
}
