import { PlatformAccountsService } from './platform-accounts.service.js';
import { LinkAccountDto } from './dto/link-account.dto.js';
export declare class PlatformAccountsController {
    private readonly platformAccountsService;
    constructor(platformAccountsService: PlatformAccountsService);
    findAll(userId: string): Promise<import("../models/platform-account.model.js").PlatformAccount[]>;
    link(userId: string, dto: LinkAccountDto): Promise<{
        id: string;
        platform: import("../models/platform-account.model.js").Platform;
        email: string;
        isConnected: boolean;
        status: import("../models/platform-account.model.js").AccountStatus;
    }>;
    unlink(userId: string, accountId: string): Promise<{
        message: string;
    }>;
    pause(userId: string, accountId: string): Promise<{
        message: string;
    }>;
    resume(userId: string, accountId: string): Promise<{
        message: string;
    }>;
}
