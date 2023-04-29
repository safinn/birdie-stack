import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type { OrganisationDb } from '../OrganisationDb'
import type { NewOrganisation, Organisation } from './schema'
import { organisations } from './schema'
import { eq } from 'drizzle-orm'

export class OrganisationImp implements OrganisationDb {
  db: PostgresJsDatabase

  constructor(db: PostgresJsDatabase) {
    this.db = db
  }

  createOrganisation(organisation: NewOrganisation): Promise<Organisation[]> {
    return this.db.insert(organisations).values(organisation).returning()
  }

  getOrganisationById(id: string): Promise<Organisation[]> {
    return this.db.select().from(organisations).where(eq(organisations.id, id))
  }
}
