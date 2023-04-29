import type postgres from 'postgres'
import type { UserDto } from '../model/User'
import type { UserDb } from '../UserDb'

export class User implements UserDb {
  sql: postgres.Sql

  constructor(sql: postgres.Sql) {
    this.sql = sql
  }

  findUserByEmail(email: string): Promise<UserDto[]> {
    return this.sql`select * from user_ where email = ${email}`
  }

  findUserById(id: string): Promise<UserDto[]> {
    return this.sql`select * from user_ where id = ${id}`
  }

  createUser(email: string, defaultOrganisationId: string): Promise<UserDto[]> {
    return this.sql`insert into user_ ${this.sql({
      email,
      defaultOrganisationId,
    })} returning *`
  }

  updateUser(user: UserDto): Promise<UserDto[]> {
    return this.sql`update user_ set ${this.sql(
      user,
      'email',
      'fullName',
      'defaultOrganisationId'
    )} where id = ${user.id} returning *`
  }
}
