import type postgres from 'postgres'
import type { InvitationDto } from '../model/Invitation'
import type { InvitationDb } from '../InvitationDb'

export class Invitation implements InvitationDb {
  sql: postgres.Sql

  constructor(sql: postgres.Sql) {
    this.sql = sql
  }

  createInvitation(
    userId: string,
    organisationId: string,
    email: string
  ): Promise<InvitationDto[]> {
    return this.sql`insert into invitation ${this.sql({
      organisationId,
      createdBy: userId,
      email,
    })} returning *`
  }

  acceptInvitation(id: string, userId: string): Promise<InvitationDto[]> {
    return this
      .sql`update invitation set accepted_by = ${userId}, accepted_at = ${this
      .sql`now()`} where id = ${id} returning *`
  }

  cancelInvitation(id: string, userId: string): Promise<InvitationDto[]> {
    return this.sql`update invitation set ${this.sql({
      cancelledBy: userId,
    })}, cancelled_at = ${this.sql`now()`} where id = ${id} returning *`
  }

  getInvitationById(id: string): Promise<InvitationDto[]> {
    return this.sql`select * from invitation where id = ${id}`
  }
}
