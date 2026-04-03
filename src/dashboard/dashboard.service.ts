import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, fn, col } from 'sequelize';
import { JobApplication } from '../models/job-application.model.js';
import { Job } from '../models/job.model.js';
import { PlatformAccount } from '../models/platform-account.model.js';
import { JobPreference } from '../models/job-preference.model.js';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(JobApplication)
    private readonly jobApplicationModel: typeof JobApplication,
    @InjectModel(PlatformAccount)
    private readonly platformAccountModel: typeof PlatformAccount,
    @InjectModel(JobPreference)
    private readonly jobPreferenceModel: typeof JobPreference,
  ) {}

  async getDashboard(userId: string) {
    const [stats, recentApplications, platformStatus, activePreferences] =
      await Promise.all([
        this.getApplicationStats(userId),
        this.getRecentApplications(userId),
        this.getPlatformStatus(userId),
        this.getActivePreferences(userId),
      ]);

    return {
      stats,
      recentApplications,
      platformStatus,
      activePreferences,
    };
  }

  private async getApplicationStats(userId: string) {
    const total = await this.jobApplicationModel.count({ where: { userId } });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await this.jobApplicationModel.count({
      where: { userId, appliedAt: { [Op.gte]: today } },
    });

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekCount = await this.jobApplicationModel.count({
      where: { userId, appliedAt: { [Op.gte]: weekAgo } },
    });

    const statusBreakdown = await this.jobApplicationModel.findAll({
      where: { userId },
      attributes: ['status', [fn('COUNT', col('status')), 'count']],
      group: ['status'],
      raw: true,
    });

    return {
      totalApplications: total,
      appliedToday: todayCount,
      appliedThisWeek: weekCount,
      statusBreakdown,
    };
  }

  private async getRecentApplications(userId: string) {
    return this.jobApplicationModel.findAll({
      where: { userId },
      include: [{ model: Job }],
      order: [['appliedAt', 'DESC']],
      limit: 10,
    });
  }

  private async getPlatformStatus(userId: string) {
    return this.platformAccountModel.findAll({
      where: { userId },
      attributes: [
        'id',
        'platform',
        'email',
        'isConnected',
        'status',
        'lastActiveAt',
      ],
    });
  }

  private async getActivePreferences(userId: string) {
    return this.jobPreferenceModel.findAll({
      where: { userId, isActive: true },
    });
  }
}
