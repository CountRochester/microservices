/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { Request, Response } from 'express'
import { Ticket } from '../models/ticket'

const router = express.Router()

router.get('/api/tickets', async (req: Request, res: Response): Promise<void> => {
  const tickets = await Ticket.find({
    orderId: undefined,
  })

  res.contentType('application/json')
    .status(200)
    .send(tickets)
})

export { router as getAllTicketsRouter }
