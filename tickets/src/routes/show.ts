/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { Request, Response } from 'express'
import { NotFoundError, BadRequestError } from '@cr-tickets/common'
import { Ticket } from '../models/ticket'

const router = express.Router()

router.get('/api/tickets/:id', async (req: Request, res: Response): Promise<void> => {
  if (!req.params.id || typeof req.params.id !== 'string') {
    throw new BadRequestError('id was not provided')
  }
  const { id } = req.params
  const ticket = await Ticket.findById(id)
  if (!ticket) {
    throw new NotFoundError()
  }
  res.contentType('application/json')
    .status(200)
    .send(ticket)
})

export { router as getTicketRouter }
