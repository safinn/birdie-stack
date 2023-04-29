import { db as dbClient } from '~/services/db.server'

import type { UserDb } from './UserDb'
import type { OrganisationDb } from './OrganisationDb'
import type { MembershipDb } from './MembershipDb'
import type { OtpDb } from './OtpDb'
import type { InvitationDb } from './InvitationDb'

import { createStore } from './pg'

export type Store = {
  user: UserDb
  organisation: OrganisationDb
  membership: MembershipDb
  otp: OtpDb
  invitation: InvitationDb

  transaction: <T>(fn: (tx: Store) => Promise<T>) => Promise<T>
}

export const db = createStore(dbClient)
