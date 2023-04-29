import type { OtpDto } from './model/Otp'

export interface OtpDb {
  createOtp(code: string): Promise<OtpDto[]>
  findOtpByCode(code: string): Promise<OtpDto[]>
  updateOtp(
    code: string,
    active?: boolean,
    attempts?: number
  ): Promise<OtpDto[]>
}
