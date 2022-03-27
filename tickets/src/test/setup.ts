/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-extraneous-dependencies */
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var signin: ({ email, id }?: { email: string, id: string }) => string[]
}
jest.mock('../nats-wrapper.ts')

let mongo!: MongoMemoryServer

beforeAll(async () => {
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

afterAll(async () => {
  await mongo.stop()
  await mongoose.connection.close()
})

global.signin = ({ email, id }: { email: string, id: string } = { email: 'test@test.com', id: 'test' }): string[] => {
  const jwtPayload = { email, id }
  const userToken = jwt.sign(jwtPayload, process.env.JWT_KEY || 'secret')
  const session = Buffer.from(JSON.stringify({
    jwt: userToken,
  })).toString('base64')
  const cookie = [`session=${session}`]
  return cookie
}
