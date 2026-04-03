import { ConfigService } from '@nestjs/config';
import { PlatformAccount, AccountStatus } from '../models/platform-account.model.js';
import { LinkAccountDto } from './dto/link-account.dto.js';
export declare class PlatformAccountsService {
    private readonly platformAccountModel;
    private readonly configService;
    private readonly encryptionKey;
    constructor(platformAccountModel: typeof PlatformAccount, configService: ConfigService);
    findAllByUser(userId: string): Promise<PlatformAccount[]>;
    linkAccount(userId: string, dto: LinkAccountDto): Promise<{
        id: string;
        platform: import("../models/platform-account.model.js").Platform;
        email: string;
        isConnected: boolean;
        status: AccountStatus;
    }>;
    unlinkAccount(userId: string, accountId: string): Promise<{
        message: string;
    }>;
    pauseAccount(userId: string, accountId: string): Promise<{
        message: string;
    }>;
    resumeAccount(userId: string, accountId: string): Promise<{
        message: string;
    }>;
    getDecryptedCredentials(userId: string, platform: string): Promise<{
        email: string;
        password: string;
        sessionData: string | null;
    } | null>;
    updateSessionData(accountId: string, sessionData: string): Promise<void>;
    markError(accountId: string): Promise<void>;
}
