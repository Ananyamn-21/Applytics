"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseScraperService = void 0;
const common_1 = require("@nestjs/common");
class BaseScraperService {
    configService;
    logger;
    minDelay;
    maxDelay;
    constructor(configService, loggerContext) {
        this.configService = configService;
        this.logger = new common_1.Logger(loggerContext);
        this.minDelay =
            this.configService.get('autoApply.minDelaySeconds') * 1000;
        this.maxDelay =
            this.configService.get('autoApply.maxDelaySeconds') * 1000;
    }
    async randomDelay() {
        const delay = Math.floor(Math.random() * (this.maxDelay - this.minDelay) + this.minDelay);
        await new Promise((resolve) => setTimeout(resolve, delay));
    }
    async exponentialBackoff(attempt) {
        const baseDelay = 5000;
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 3000;
        this.logger.warn(`Backoff attempt ${attempt}, waiting ${Math.round(delay / 1000)}s`);
        await new Promise((resolve) => setTimeout(resolve, delay));
    }
}
exports.BaseScraperService = BaseScraperService;
//# sourceMappingURL=base-scraper.service.js.map