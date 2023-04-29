import type { NewOtp, Otp } from './pg/schema'

export interface OtpDb {
  createOtp(otp: NewOtp): Promise<Otp[]>
  findOtpByCode(code: string): Promise<Otp[]>
  updateOtp(code: string, active?: boolean, attempts?: number): Promise<Otp[]>
}
