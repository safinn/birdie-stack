import type postgres from 'postgres'
import type { Store } from '..'

import { sql } from '~/services/db.server'
import { Otp } from './Otp'
import { Organisation } from './Organisation'
import { User } from './User'
import { Membership } from './Membership'
import { Invitation } from './Invitation'

export function createStore(sql: postgres.Sql): Store {
  return {
    user: new User(sql),
    organisation: new Organisation(sql),
    membership: new Membership(sql),
    otp: new Otp(sql),
    invitation: new Invitation(sql),
  }
}

export function transaction<T>(fn: (tx: Store) => Promise<T>) {
  return sql.begin((sql) => {
    const s = createStore(sql)
    return fn(s)
  })
}
