import type { NewOrganisation, Organisation } from './pg/schema'

export interface OrganisationDb {
  createOrganisation(organisation: NewOrganisation): Promise<Organisation[]>
  getOrganisationById(id: string): Promise<Organisation[]>
}
