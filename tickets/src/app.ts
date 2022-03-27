import express from 'express'
import 'express-async-errors'
import cookieSession from 'cookie-session'
import { NotFoundError, errorHandler, currentUser } from '@cr-tickets/common'
import { createTicketRouter } from './routes/new'
import { getTicketRouter } from './routes/show'
import { getAllTicketsRouter } from './routes'
import { updateTicketRouter } from './routes/update'

const app = express()
app.set('trust proxy', true)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
app.use(cookieSession({
  signed: false,
  secure: process.env.NODE_ENV !== 'test',
}))

app.use(currentUser)

app.use(getTicketRouter)
app.use(createTicketRouter)
app.use(getAllTicketsRouter)
app.use(updateTicketRouter)

app.all('*', () => {
  throw new NotFoundError()
})
app.use(errorHandler)

export default app
