import type { Invitation, NewInvitation } from './pg/schema'

export interface InvitationDb {
  createInvitation(invitation: NewInvitation): Promise<Invitation[]>
  acceptInvitation(id: string, userId: string): Promise<Invitation[]>
  cancelInvitation(id: string, userId: string): Promise<Invitation[]>
  getInvitationById(id: string): Promise<Invitation[]>
}
