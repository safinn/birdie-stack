import type { InvitationDto } from './model/Invitation'

export interface InvitationDb {
  createInvitation(
    userId: string,
    organisationId: string,
    email: string
  ): Promise<InvitationDto[]>
  acceptInvitation(id: string, userId: string): Promise<InvitationDto[]>
  cancelInvitation(id: string, userId: string): Promise<InvitationDto[]>
  getInvitationById(id: string): Promise<InvitationDto[]>
}
