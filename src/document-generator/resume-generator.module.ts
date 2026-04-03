import { Module } from '@nestjs/common';
import { ResumeGeneratorService } from './resume-generator.service.js';

@Module({
  providers: [ResumeGeneratorService],
  exports: [ResumeGeneratorService],
})
export class ResumeGeneratorModule {}
