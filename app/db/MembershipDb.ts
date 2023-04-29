import type { MembershipDto } from './model/Membership'

export interface MembershipDb {
  createMembership(
    userId: string,
    organisationId: string
  ): Promise<MembershipDto[]>
  getMembershipByIdForUser(
    organisationId: string,
    userId: string
  ): Promise<MembershipDto[]>
}
