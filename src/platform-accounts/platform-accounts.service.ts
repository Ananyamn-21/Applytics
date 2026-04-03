import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import {
  PlatformAccount,
  AccountStatus,
} from '../models/platform-account.model.js';
import { encrypt, decrypt } from '../common/encryption.util.js';
import { LinkAccountDto } from './dto/link-account.dto.js';

@Injectable()
export class PlatformAccountsService {
  private readonly encryptionKey: string;

  constructor(
    @InjectModel(PlatformAccount)
    private readonly platformAccountModel: typeof PlatformAccount,
    private readonly configService: ConfigService,
  ) {
    this.encryptionKey = this.configService.get<string>('encryption.key')!;
  }

  async findAllByUser(userId: string) {
    const accounts = await this.platformAccountModel.findAll({
      where: { userId },
      attributes: { exclude: ['encryptedPassword', 'sessionData'] },
    });
    return accounts;
  }

  async linkAccount(userId: string, dto: LinkAccountDto) {
    const existing = await this.platformAccountModel.findOne({
      where: { userId, platform: dto.platform },
    });
    if (existing) {
      throw new ConflictException(
        `${dto.platform} account already linked. Unlink first.`,
      );
    }

    const encryptedPassword = encrypt(dto.password, this.encryptionKey);
    const account = await this.platformAccountModel.create({
      userId,
      platform: dto.platform,
      email: dto.email,
      encryptedPassword,
      isConnected: true,
      status: AccountStatus.ACTIVE,
    });

    return {
      id: account.id,
      platform: account.platform,
      email: account.email,
      isConnected: account.isConnected,
      status: account.status,
    };
  }

  async unlinkAccount(userId: string, accountId: string) {
    const account = await this.platformAccountModel.findOne({
      where: { id: accountId, userId },
    });
    if (!account) {
      throw new NotFoundException('Platform account not found');
    }
    await account.destroy();
    return { message: `${account.platform} account unlinked` };
  }

  async pauseAccount(userId: string, accountId: string) {
    const account = await this.platformAccountModel.findOne({
      where: { id: accountId, userId },
    });
    if (!account) {
      throw new NotFoundException('Platform account not found');
    }
    account.status = AccountStatus.PAUSED;
    await account.save();
    return { message: `${account.platform} account paused` };
  }

  async resumeAccount(userId: string, accountId: string) {
    const account = await this.platformAccountModel.findOne({
      where: { id: accountId, userId },
    });
    if (!account) {
      throw new NotFoundException('Platform account not found');
    }
    account.status = AccountStatus.ACTIVE;
    await account.save();
    return { message: `${account.platform} account resumed` };
  }

  async getDecryptedCredentials(
    userId: string,
    platform: string,
  ): Promise<{
    email: string;
    password: string;
    sessionData: string | null;
  } | null> {
    const account = await this.platformAccountModel.findOne({
      where: { userId, platform, status: AccountStatus.ACTIVE },
    });
    if (!account) return null;

    return {
      email: account.email,
      password: decrypt(account.encryptedPassword, this.encryptionKey),
      sessionData: account.sessionData,
    };
  }

  async updateSessionData(accountId: string, sessionData: string) {
    await this.platformAccountModel.update(
      { sessionData, lastActiveAt: new Date() },
      { where: { id: accountId } },
    );
  }

  async markError(accountId: string) {
    await this.platformAccountModel.update(
      { status: AccountStatus.ERROR },
      { where: { id: accountId } },
    );
  }
}
