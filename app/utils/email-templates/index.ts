import { invite } from './invite'
import { login } from './login'

export const emailConstructors = { invite, login } as {
  [key: string]: Function
}
