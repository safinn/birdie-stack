export type OtpDto = {
  id: string
  code: string
  active: boolean
  attempts: number
  createdAt: Date
  updatedAt?: Date
}
