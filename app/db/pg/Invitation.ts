import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { eq, sql } from 'drizzle-orm'
import type { InvitationDb } from '../InvitationDb'
import type { NewInvitation, Invitation } from './schema'
import { invitations } from './schema'

export class InvitationImp implements InvitationDb {
  db: PostgresJsDatabase

  constructor(db: PostgresJsDatabase) {
    this.db = db
  }

  async createInvitation(invitation: NewInvitation): Promise<Invitation[]> {
    return this.db.insert(invitations).values(invitation).returning()
  }

  acceptInvitation(id: string, userId: string): Promise<Invitation[]> {
    return this.db
      .update(invitations)
      .set({
        acceptedBy: userId,
        acceptedAt: sql`now()`,
      })
      .where(eq(invitations.id, id))
      .returning()
  }

  cancelInvitation(id: string, userId: string): Promise<Invitation[]> {
    return this.db
      .update(invitations)
      .set({
        cancelledBy: userId,
        cancelledAt: sql`now()`,
      })
      .where(eq(invitations.id, id))
      .returning()
  }

  getInvitationById(id: string): Promise<Invitation[]> {
    return this.db.select().from(invitations).where(eq(invitations.id, id))
  }
}
