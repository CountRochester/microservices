import express, { Request, Response } from 'express'
import mongoose from 'mongoose'
import {
  requireAuth, validateRequest, NotFoundError, ForbiddenError, currentUser,
} from '@cr-tickets/common'
import { param } from 'express-validator'
import { Order, OrderDocument } from '../models/orders'
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher'
import { natsWrapper } from '../nats-wrapper'

type DeleteOrderParams = {
  orderId: string
}

const router = express.Router()

const validators = [
  param('orderId')
    .not()
    .isEmpty()
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('A valid orderId must be provided'),
]

router.delete(
  '/api/orders/:orderId',
  currentUser,
  requireAuth,
  validators,
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId } = req.params as DeleteOrderParams
    const order = await Order.findById(orderId).populate('ticket') as OrderDocument
    // console.log({ order })
    if (!order) {
      throw new NotFoundError()
    }
    if (order.userId !== req.currentUser!.id) {
      throw new ForbiddenError()
    }

    order.status = 'cancelled'
    await order.save()

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: String(order.id),
      version: order.version,
      ticket: {
        id: String(order.ticket.id),
      },
    })

    res
      .status(204)
      .contentType('application/json')
      .send(order)
  },
)

export { router as deleteOrderRouter }
