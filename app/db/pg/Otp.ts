import type { OtpDb } from '../OtpDb'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type { NewOtp, Otp } from './schema'
import { otps } from './schema'
import { eq } from 'drizzle-orm'

export class OtpImp implements OtpDb {
  db: PostgresJsDatabase

  constructor(db: PostgresJsDatabase) {
    this.db = db
  }

  createOtp(otp: NewOtp): Promise<Otp[]> {
    return this.db.insert(otps).values(otp).returning()
  }

  findOtpByCode(code: string): Promise<Otp[]> {
    return this.db.select().from(otps).where(eq(otps.code, code))
  }

  updateOtp(code: string, active?: boolean, attempts?: number): Promise<Otp[]> {
    const values = {
      ...(active !== undefined ? { active } : {}),
      ...(attempts !== undefined ? { attempts } : {}),
    }
    return this.db
      .update(otps)
      .set(values)
      .where(eq(otps.code, code))
      .returning()
  }
}
