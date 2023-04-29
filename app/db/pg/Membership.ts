import type postgres from 'postgres'
import type { MembershipDto } from '../model/Membership'
import type { MembershipDb } from '../MembershipDb'

export class Membership implements MembershipDb {
  sql: postgres.Sql

  constructor(sql: postgres.Sql) {
    this.sql = sql
  }

  createMembership(
    userId: string,
    organisationId: string
  ): Promise<MembershipDto[]> {
    return this.sql`insert into membership ${this.sql({
      userId,
      organisationId,
    })} returning *`
  }

  getMembershipByIdForUser(
    organisationId: string,
    userId: string
  ): Promise<MembershipDto[]> {
    return this
      .sql`select * from membership where organisation_id = ${organisationId} and user_id = ${userId}`
  }
}
