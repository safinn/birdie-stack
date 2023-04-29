import { sql } from '~/services/db.server'

import type { UserDb } from './UserDb'
import type { OrganisationDb } from './OrganisationDb'
import type { MembershipDb } from './MembershipDb'
import type { OtpDb } from './OtpDb'
import type { InvitationDb } from './InvitationDb'

import { createStore } from './pg'

export { transaction } from './pg'

export type Store = {
  user: UserDb
  organisation: OrganisationDb
  membership: MembershipDb
  otp: OtpDb
  invitation: InvitationDb
}

export default createStore(sql)
