import { Module } from '@nestjs/common';
import { LinkedinScraperService } from './linkedin-scraper.service.js';
import { NaukriScraperService } from './naukri-scraper.service.js';

@Module({
  providers: [LinkedinScraperService, NaukriScraperService],
  exports: [LinkedinScraperService, NaukriScraperService],
})
export class ScrapersModule {}
