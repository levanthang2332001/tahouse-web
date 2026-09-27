import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { D1_DATABASE } from '@/database';
import type { D1Database } from '@/database';
import { users } from '../schemas/user.schema';

export interface JwtPayload {
  sub: string;
  username?: string;
  email?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject(D1_DATABASE)
    private readonly db: D1Database,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub));

    const user = result[0];
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
