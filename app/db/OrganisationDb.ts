import type { OrganisationDto } from './model/Organisation'

export interface OrganisationDb {
  createOrganisation(
    name: string,
    description?: string,
    createdBy?: string
  ): Promise<OrganisationDto[]>
  getOrganisationById(id: string): Promise<OrganisationDto[]>
}
