import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JobPreferencesService } from './job-preferences.service.js';
import {
  CreateJobPreferenceDto,
  UpdateJobPreferenceDto,
} from './dto/create-job-preference.dto.js';

@Controller('job-preferences')
@UseGuards(JwtAuthGuard)
export class JobPreferencesController {
  constructor(private readonly jobPreferencesService: JobPreferencesService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.jobPreferencesService.findAllByUser(userId);
  }

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateJobPreferenceDto,
  ) {
    return this.jobPreferencesService.create(userId, dto);
  }

  @Put(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateJobPreferenceDto,
  ) {
    return this.jobPreferencesService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.jobPreferencesService.remove(userId, id);
  }
}
