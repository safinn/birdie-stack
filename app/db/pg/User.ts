import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type { UserDb } from '../UserDb'
import { users } from './schema'
import type { NewUser, User } from './schema'
import { eq } from 'drizzle-orm'

export class UserImp implements UserDb {
  db: PostgresJsDatabase

  constructor(db: PostgresJsDatabase) {
    this.db = db
  }

  findUserByEmail(email: string): Promise<User[]> {
    return this.db.select().from(users).where(eq(users.email, email))
  }

  findUserById(id: string): Promise<User[]> {
    return this.db.select().from(users).where(eq(users.id, id))
  }

  createUser(user: NewUser): Promise<User[]> {
    return this.db.insert(users).values(user).returning()
  }

  updateUser(user: User): Promise<User[]> {
    return this.db
      .update(users)
      .set(user)
      .where(eq(users.id, user.id))
      .returning()
  }
}
