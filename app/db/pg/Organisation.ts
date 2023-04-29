import type postgres from 'postgres'
import type { OrganisationDto } from '../model/Organisation'
import type { OrganisationDb } from '../OrganisationDb'

export class Organisation implements OrganisationDb {
  sql: postgres.Sql

  constructor(sql: postgres.Sql) {
    this.sql = sql
  }

  createOrganisation(
    name: string,
    description?: string,
    createdBy?: string
  ): Promise<OrganisationDto[]> {
    const values = {
      name,
      description,
      ...(createdBy !== undefined ? { createdBy } : {}),
    }
    return this.sql`insert into organisation ${this.sql(values)} returning *`
  }

  getOrganisationById(id: string): Promise<OrganisationDto[]> {
    return this.sql`select * from organisation where id = ${id}`
  }
}
