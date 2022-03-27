import express from 'express'
import 'express-async-errors'
import cookieSession from 'cookie-session'
import { NotFoundError, errorHandler } from '@cr-tickets/common'

import {
  currentUserRouter, signInRouter, signOutRouter, signUpRouter,
} from './routes'

const app = express()
app.set('trust proxy', true)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
app.use(cookieSession({
  signed: false,
  secure: process.env.NODE_ENV !== 'test',
}))

app.use(currentUserRouter)
app.use(signInRouter)
app.use(signOutRouter)
app.use(signUpRouter)

app.all('*', () => {
  throw new NotFoundError()
})
app.use(errorHandler)

export default app
