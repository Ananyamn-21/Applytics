import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Res,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import * as fs from 'fs';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JobApplicationsService } from './job-applications.service.js';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class JobApplicationsController {
  constructor(
    private readonly jobApplicationsService: JobApplicationsService,
  ) {}

  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.jobApplicationsService.findAllByUser(
      userId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('stats')
  getStats(@CurrentUser('id') userId: string) {
    return this.jobApplicationsService.getStats(userId);
  }

  @Get(':id')
  findOne(
    @CurrentUser('id') userId: string,
    @Param('id') applicationId: string,
  ) {
    return this.jobApplicationsService.findById(userId, applicationId);
  }

  @Get(':id/resume')
  async downloadResume(
    @CurrentUser('id') userId: string,
    @Param('id') applicationId: string,
    @Res() res: Response,
  ) {
    const application = await this.jobApplicationsService.findById(
      userId,
      applicationId,
    );

    if (
      !application.tailoredResumeUrl ||
      !fs.existsSync(application.tailoredResumeUrl)
    ) {
      throw new NotFoundException('Resume file not found for this application');
    }

    const file = fs.createReadStream(application.tailoredResumeUrl);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="tailored-resume-${applicationId}.pdf"`,
    });

    file.pipe(res);
  }
}
