import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../models/user.model.js';
import { UserProfile } from '../models/user-profile.model.js';
import { Skill } from '../models/skill.model.js';
import { JobPreference } from '../models/job-preference.model.js';
import { PlatformAccount } from '../models/platform-account.model.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(UserProfile)
    private readonly userProfileModel: typeof UserProfile,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userModel.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        { model: UserProfile },
        { model: Skill },
        { model: JobPreference },
        {
          model: PlatformAccount,
          attributes: { exclude: ['encryptedPassword', 'sessionData'] },
        },
      ],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.firstName) user.firstName = dto.firstName;
    if (dto.lastName) user.lastName = dto.lastName;
    await user.save();

    const profile = await this.userProfileModel.findOne({ where: { userId } });
    if (profile) {
      if (dto.experience !== undefined) profile.experience = dto.experience;
      if (dto.location) profile.location = dto.location;
      if (dto.phone) profile.phone = dto.phone;
      if (dto.summary) profile.summary = dto.summary;
      await profile.save();
    }

    return this.getProfile(userId);
  }

  async uploadResume(userId: string, file: any) {
    const profile = await this.userProfileModel.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileObj = file as {
      originalname: string;
      buffer: Buffer;
      mimetype: string;
    };
    const fileName = `${userId}-${Date.now()}${path.extname(fileObj.originalname)}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, fileObj.buffer);

    let resumeText = '';
    if (fileObj.mimetype === 'application/pdf') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
        const pdfParse = require('pdf-parse');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        const result = await pdfParse(fileObj.buffer);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        resumeText = result.text;
      } catch {
        resumeText = '';
      }
    }

    profile.resumeUrl = `/uploads/resumes/${fileName}`;
    if (resumeText) {
      profile.resumeText = resumeText;
    }
    await profile.save();

    return {
      resumeUrl: profile.resumeUrl,
      parsed: !!resumeText,
    };
  }
}
