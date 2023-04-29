import type { InferModel } from 'drizzle-orm'
import {
  pgTable,
  boolean,
  timestamp,
  primaryKey,
  varchar,
  integer,
  text,
} from 'drizzle-orm/pg-core'
import { uuidv7 } from './uuidv7'

export const otps = pgTable('otp', {
  id: uuidv7('id').primaryKey().defaultRandom(),
  code: text('code').notNull(),
  active: boolean('active').notNull().default(false),
  attempts: integer('attempts').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
})

export type Otp = InferModel<typeof otps>
export type NewOtp = InferModel<typeof otps, 'insert'>

export const users = pgTable('user_', {
  id: uuidv7('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 320 }).notNull(),
  fullName: text('full_name'),
  defaultOrganisationId: uuidv7('default_organisation_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type User = InferModel<typeof users>
export type NewUser = InferModel<typeof users, 'insert'>

export const organisations = pgTable('organisation', {
  id: uuidv7('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdBy: uuidv7('created_by'),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
  updatedBy: uuidv7('updated_by'),
})

export type Organisation = InferModel<typeof organisations>
export type NewOrganisation = InferModel<typeof organisations, 'insert'>

export const memberships = pgTable(
  'membership',
  {
    userId: uuidv7('user_id')
      .notNull()
      .references(() => users.id),
    organisationId: uuidv7('organisation_id')
      .notNull()
      .references(() => organisations.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey(table.userId, table.organisationId),
  })
)

export type Membership = InferModel<typeof memberships>
export type NewMembership = InferModel<typeof memberships, 'insert'>

export const invitations = pgTable('invitation', {
  id: uuidv7('id').primaryKey().defaultRandom(),
  organisationId: uuidv7('organisation_id')
    .notNull()
    .references(() => organisations.id),
  email: text('email').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdBy: uuidv7('created_by')
    .notNull()
    .references(() => users.id),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  acceptedBy: uuidv7('accepted_by').references(() => users.id),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  cancelledBy: uuidv7('cancelled_by').references(() => users.id),
})

export type Invitation = InferModel<typeof invitations>
export type NewInvitation = InferModel<typeof invitations, 'insert'>
