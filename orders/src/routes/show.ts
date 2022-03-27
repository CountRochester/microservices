import mongoose from 'mongoose'
import express, { Request, Response } from 'express'
import {
  requireAuth, validateRequest, NotFoundError, ForbiddenError, currentUser,
} from '@cr-tickets/common'
import { param } from 'express-validator'
import { Order, OrderDocument } from '../models/orders'

type ShowOrderParams = {
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

router.get(
  '/api/orders/:orderId',
  currentUser,
  requireAuth,
  validators,
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId } = req.params as ShowOrderParams
    const order = await Order.findById(orderId).populate('ticket') as OrderDocument | null
    if (!order) {
      throw new NotFoundError()
    }
    if (order.userId !== req.currentUser!.id) {
      throw new ForbiddenError()
    }
    res
      .status(200)
      .contentType('application/json')
      .send(order)
  },
)

export { router as showOrderRouter }
