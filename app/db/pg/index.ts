import type { Store } from '..'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { OtpImp } from './Otp'
import { OrganisationImp } from './Organisation'
import { UserImp } from './User'
import { MembershipImp } from './Membership'
import { InvitationImp } from './Invitation'
import { PgTransaction } from 'drizzle-orm/pg-core'

export function createStore(db: PostgresJsDatabase): Store {
  return {
    user: new UserImp(db),
    organisation: new OrganisationImp(db),
    membership: new MembershipImp(db),
    otp: new OtpImp(db),
    invitation: new InvitationImp(db),

    transaction: <T>(fn: (tx: Store) => Promise<T>) => {
      // Already in a transaction
      if (db instanceof PgTransaction) {
        return fn(createStore(db))
      }

      return db.transaction((tx) => {
        return fn(createStore(tx))
      })
    },
  }
}
