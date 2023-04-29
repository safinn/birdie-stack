import type { MembershipDb } from '../MembershipDb'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type { Membership, NewMembership } from './schema'
import { memberships } from './schema'
import { and, eq } from 'drizzle-orm'

export class MembershipImp implements MembershipDb {
  db: PostgresJsDatabase

  constructor(db: PostgresJsDatabase) {
    this.db = db
  }

  createMembership(membership: NewMembership): Promise<Membership[]> {
    return this.db.insert(memberships).values(membership).returning()
  }

  getMembershipByIdForUser(
    organisationId: string,
    userId: string
  ): Promise<Membership[]> {
    return this.db
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.organisationId, organisationId),
          eq(memberships.userId, userId)
        )
      )
  }
}
