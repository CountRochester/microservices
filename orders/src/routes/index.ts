import express, { Request, Response } from 'express'
import { requireAuth, currentUser } from '@cr-tickets/common'
import { Order } from '../models/orders'

const router = express.Router()

router.get(
  '/api/orders',
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const orders = await Order.find({
      userId: req.currentUser!.id,
      status: { $ne: 'cancelled' },
    }).populate('ticket')
    res
      .status(200)
      .contentType('application/json')
      .send(orders)
  },
)

export { router as indexOrderRouter }
