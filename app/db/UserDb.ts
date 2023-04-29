import type { NewUser, User } from './pg/schema'

export interface UserDb {
  findUserByEmail(email: string): Promise<User[]>
  findUserById(id: string): Promise<User[]>
  createUser(user: NewUser): Promise<User[]>
  updateUser(user: User): Promise<User[]>
}
