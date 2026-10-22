import { Injectable, Inject } from '@nestjs/common';
import { eq, and, gt } from 'drizzle-orm';
import { D1_DATABASE } from '@/database/d1.constants';
import type { D1Database } from '@/database/d1.client';
import {
  refreshTokens,
  RefreshToken,
  NewRefreshToken,
} from '../schemas/refresh-token.schema';
import { User } from '../schemas/user.schema';

@Injectable()
export class RefreshTokensRepository {
  constructor(@Inject(D1_DATABASE) private readonly db: D1Database) {}

  async create(data: NewRefreshToken): Promise<void> {
    await this.db.insert(refreshTokens).values(data);
  }

  async findActiveByHashedToken(
    hashedToken: string,
  ): Promise<(RefreshToken & { user: User }) | undefined> {
    return this.db.query.refreshTokens.findFirst({
      where: and(
        eq(refreshTokens.hashedToken, hashedToken),
        eq(refreshTokens.isRevoked, false),
        gt(refreshTokens.expiresAt, new Date()),
      ),
      with: {
        user: true,
      },
    });
  }

  async revokeById(id: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.id, id));
  }

  async revokeByHashedToken(hashedToken: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.hashedToken, hashedToken));
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(
        and(
          eq(refreshTokens.userId, userId),
          eq(refreshTokens.isRevoked, false),
        ),
      );
  }
}
