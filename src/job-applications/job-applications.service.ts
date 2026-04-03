import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import {
  JobApplication,
  ApplicationStatus,
} from '../models/job-application.model.js';
import { Job } from '../models/job.model.js';

@Injectable()
export class JobApplicationsService {
  constructor(
    @InjectModel(JobApplication)
    private readonly jobApplicationModel: typeof JobApplication,
  ) {}

  async findAllByUser(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows, count } = await this.jobApplicationModel.findAndCountAll({
      where: { userId },
      include: [{ model: Job }],
      order: [['appliedAt', 'DESC']],
      limit,
      offset,
    });
    return { applications: rows, total: count, page, limit };
  }

  async findById(userId: string, applicationId: string) {
    const application = await this.jobApplicationModel.findOne({
      where: { id: applicationId, userId },
      include: [{ model: Job }],
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return application;
  }

  async createApplication(data: {
    userId: string;
    jobId: string;
    tailoredResumeText?: string;
    tailoredResumeUrl?: string;
    notes?: string;
  }) {
    return this.jobApplicationModel.create({
      ...data,
      status: ApplicationStatus.APPLIED,
      appliedAt: new Date(),
    });
  }

  async hasApplied(userId: string, jobId: string): Promise<boolean> {
    const count = await this.jobApplicationModel.count({
      where: { userId, jobId },
    });
    return count > 0;
  }

  async countTodayApplications(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.jobApplicationModel.count({
      where: {
        userId,
        appliedAt: { [Op.gte]: today },
      },
    });
  }

  async countHourApplications(userId: string): Promise<number> {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.jobApplicationModel.count({
      where: {
        userId,
        appliedAt: { [Op.gte]: hourAgo },
      },
    });
  }

  async getStats(userId: string) {
    const total = await this.jobApplicationModel.count({ where: { userId } });
    const byStatus = await this.jobApplicationModel.count({
      where: { userId },
      group: ['status'],
    });
    return { total, byStatus };
  }
}
