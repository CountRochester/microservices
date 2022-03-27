import mongoose from 'mongoose'
import express, { Request, Response } from 'express'
import {
  requireAuth, validateRequest, NotFoundError, BadRequestError, currentUser,
} from '@cr-tickets/common'
import { body } from 'express-validator'
import { Ticket, TicketDocument } from '../models/ticket'
import { Order } from '../models/orders'
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher'
import { natsWrapper } from '../nats-wrapper'

type CreateOrderBody = {
  ticketId: string
}

const EXPIRATION_WINDOW_SECONDS = 1 * 60

const reservedTicketCheck = async (ticket: TicketDocument): Promise<void> => {
  const isReserved = await ticket.isReserved()
  if (isReserved) {
    throw new BadRequestError(`Ticket id: ${String(ticket.id)} is already reserved`)
  }
}

const router = express.Router()

const validators = [
  body('ticketId')
    .not()
    .isEmpty()
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('TicketId must be provided'),
]

router.post(
  '/api/orders',
  currentUser,
  requireAuth,
  validators,
  validateRequest,
  async (req: Request, res: Response): Promise<void> => {
    const { ticketId } = req.body as CreateOrderBody

    const ticket = await Ticket.findById(ticketId) as TicketDocument
    if (!ticket) {
      throw new NotFoundError()
    }
    await reservedTicketCheck(ticket)
    const expiration = new Date()
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)
    const order = Order.build({
      userId: req.currentUser!.id,
      status: 'created',
      expiresAt: expiration,
      ticket,
    })

    await order.save()

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: String(order.id),
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      version: order.version,
      ticket: {
        id: String(ticket.id),
        price: ticket.price,
      },
    })

    res
      .status(201)
      .contentType('application/json')
      .send(order)
  },
)

export { router as newOrderRouter }
