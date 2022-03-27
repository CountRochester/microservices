import { scrypt, randomBytes, BinaryLike } from 'crypto'
import { promisify } from 'util'

type ScryptAsyncInterface = (
  password: BinaryLike,
  salt: BinaryLike,
  keylen: number
) => Promise<Buffer>

const scryptAsync: ScryptAsyncInterface = promisify(scrypt)

export class Password {
  static async toHash(password: string): Promise<string> {
    const salt = randomBytes(8).toString('hex')
    const buf = await scryptAsync(password, salt, 64)

    return `${buf.toString('hex')}.${salt}`
  }

  static async compare(storedPassword: string, suppliedPassword: string): Promise<boolean> {
    const [hashedPassword, salt] = storedPassword.split('.')
    const buf = await scryptAsync(suppliedPassword, salt, 64)

    return buf.toString('hex') === hashedPassword
  }
}
