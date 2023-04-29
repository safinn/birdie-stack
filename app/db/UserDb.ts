import type { UserDto } from './model/User'

export interface UserDb {
  findUserByEmail(email: string): Promise<UserDto[]>
  findUserById(id: string): Promise<UserDto[]>
  createUser(email: string, defaultOrganisationId: string): Promise<UserDto[]>
  updateUser(user: UserDto): Promise<UserDto[]>
}
