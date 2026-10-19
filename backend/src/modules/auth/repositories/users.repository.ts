import { Injectable, Inject } from '@nestjs/common';
import { eq, and, ne } from 'drizzle-orm';
import { D1_DATABASE } from '@/database/d1.constants';
import type { D1Database } from '@/database/d1.client';
import { users, User, NewUser } from '../schemas/user.schema';

@Injectable()
export class UsersRepository {
  constructor(@Inject(D1_DATABASE) private readonly db: D1Database) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const cleanEmail = email.trim().toLowerCase();
    return this.db.query.users.findFirst({
      where: eq(users.email, cleanEmail),
    });
  }

  async findById(id: string): Promise<User | undefined> {
    return this.db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  async findOtherUserByEmail(
    email: string,
    excludeUserId: string,
  ): Promise<User | undefined> {
    const cleanEmail = email.trim().toLowerCase();
    return this.db.query.users.findFirst({
      where: and(eq(users.email, cleanEmail), ne(users.id, excludeUserId)),
    });
  }

  async create(data: NewUser): Promise<void> {
    await this.db.insert(users).values(data);
  }

  async update(id: string, data: Partial<NewUser>): Promise<void> {
    await this.db.update(users).set(data).where(eq(users.id, id));
  }
}
