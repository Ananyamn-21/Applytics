import { ConfigService } from '@nestjs/config';
import { User } from '../../models/user.model.js';
interface JwtPayload {
    sub: string;
    email: string;
}
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly userModel;
    constructor(configService: ConfigService, userModel: typeof User);
    validate(payload: JwtPayload): Promise<{
        id: string;
        email: string;
    }>;
}
export {};
