export type InvitationDto = {
  id: string
  organisationId: string
  email: string
  createdAt: Date
  createdBy: string
  acceptedAt?: Date
  acceptedBy?: string
  cancelledAt?: Date
  cancelledBy?: string
}
