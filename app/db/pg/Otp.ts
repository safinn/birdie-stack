import type postgres from 'postgres'
import type { OtpDto } from '../model/Otp'
import type { OtpDb } from '../OtpDb'

export class Otp implements OtpDb {
  sql: postgres.Sql

  constructor(sql: postgres.Sql) {
    this.sql = sql
  }

  createOtp(code: string): Promise<OtpDto[]> {
    return this
      .sql`insert into otp (code, active, attempts) values (${code}, ${true}, ${0}) returning *`
  }

  findOtpByCode(code: string): Promise<OtpDto[]> {
    return this.sql`select * from otp where code = ${code}`
  }

  updateOtp(
    code: string,
    active?: boolean,
    attempts?: number
  ): Promise<OtpDto[]> {
    const values = {
      ...(active !== undefined ? { active } : {}),
      ...(attempts !== undefined ? { attempts } : {}),
    }
    return this.sql`update otp set ${this.sql(values)}, updated_at = ${this
      .sql`now()`} where code = ${code} returning *`
  }
}
