import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

declare global {
  var signin: ({ email, id }?: { email: string, id: string }) => string[]
}

jest.mock('../nats-wrapper')
// jest.setTimeout(30000)

jest.setTimeout(30000)
let mongo!: MongoMemoryServer

process.env.STRIPE_KEY = 'sk_test_hnfrAm8rOkryFEnV23jjfFlw';

beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf'
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

  mongo = await MongoMemoryServer.create()
  const mongoUri = mongo.getUri()

  await mongoose.connect(mongoUri)
})

beforeEach(async () => {
  jest.clearAllMocks()
  const collections = await mongoose.connection.db.collections()

  for (const collection of collections) {
    await collection.deleteMany({})
  }
})

// afterAll(async () => {
//   await mongo.stop()
//   await mongoose.connection.close()
// })

global.signin = ({ email, id }: { email: string, id: string } = { email: 'test@test.com', id: 'test' }): string[] => {
  const jwtPayload = { email, id }
  const userToken = jwt.sign(jwtPayload, process.env.JWT_KEY || 'secret')
  const session = Buffer.from(JSON.stringify({
    jwt: userToken,
  })).toString('base64')
  const cookie = [`session=${session}`]
  return cookie
}
