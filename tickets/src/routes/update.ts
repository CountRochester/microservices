import express, { Request, Response } from 'express'
import {
  requireAuth, validateRequest, BadRequestError, NotFoundError, ForbiddenError,
} from '@cr-tickets/common'
import { body } from 'express-validator'
import { Ticket, TicketDocument } from '../models/ticket'
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

const createTicketValidators = [
  body('title')
    .isString()
    .trim()
    .isLength({ min: 1, max: 250 })
    .withMessage('Invalid title'),
  body('price')
    .isFloat({ gt: 0 })
    .withMessage('Invalid price'),
]

router.put('/api/tickets/:id', createTicketValidators, requireAuth, validateRequest, async (req: Request, res: Response): Promise<void> => {
  if (!req.params.id || typeof req.params.id !== 'string') {
    throw new BadRequestError('id was not provided')
  }
  const { id } = req.params
  const ticket = await Ticket.findOne({ id }) as TicketDocument
  if (!ticket) {
    throw new NotFoundError()
  }

  if (ticket.orderId) {
    throw new BadRequestError('The ticket has already been reserved')
  }

  if (req.currentUser?.id !== ticket.userId) {
    throw new ForbiddenError('You are not own the ticket')
  }

  const { title, price } = req.body as { title: string, price: string }
  ticket.title = title
  ticket.price = +price

  await ticket.save()

  const publisher = new TicketUpdatedPublisher(natsWrapper.client)
  // eslint-disable-next-line max-len
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  publisher.publish({
    id: ticket.id as string,
    title: ticket.title,
    price: ticket.price,
    userId: ticket.userId,
    version: ticket.version,
  }).catch(console.error)

  res.contentType('application/json')
    .status(200)
    .send(ticket)
})

export { router as updateTicketRouter }
