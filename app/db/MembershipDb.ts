import type { Membership, NewMembership } from './pg/schema'

export interface MembershipDb {
  createMembership(membership: NewMembership): Promise<Membership[]>
  getMembershipByIdForUser(
    organisationId: string,
    userId: string
  ): Promise<Membership[]>
}
