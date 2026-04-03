import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JobPreference } from '../models/job-preference.model.js';
import {
  CreateJobPreferenceDto,
  UpdateJobPreferenceDto,
} from './dto/create-job-preference.dto.js';

@Injectable()
export class JobPreferencesService {
  constructor(
    @InjectModel(JobPreference)
    private readonly jobPreferenceModel: typeof JobPreference,
  ) {}

  async findAllByUser(userId: string) {
    return this.jobPreferenceModel.findAll({ where: { userId } });
  }

  async findActiveByUser(userId: string) {
    return this.jobPreferenceModel.findAll({
      where: { userId, isActive: true },
    });
  }

  async create(userId: string, dto: CreateJobPreferenceDto) {
    return this.jobPreferenceModel.create({ ...dto, userId });
  }

  async update(userId: string, id: string, dto: UpdateJobPreferenceDto) {
    const preference = await this.jobPreferenceModel.findOne({
      where: { id, userId },
    });
    if (!preference) {
      throw new NotFoundException('Job preference not found');
    }
    return preference.update(dto);
  }

  async remove(userId: string, id: string) {
    const preference = await this.jobPreferenceModel.findOne({
      where: { id, userId },
    });
    if (!preference) {
      throw new NotFoundException('Job preference not found');
    }
    await preference.destroy();
    return { message: 'Job preference deleted' };
  }
}
