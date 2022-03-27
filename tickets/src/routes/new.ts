import express, { Request, Response } from 'express'
import { requireAuth, validateRequest } from '@cr-tickets/common'
import { body } from 'express-validator'
import { Ticket } from '../models/ticket'
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher'
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

router.post('/api/tickets', createTicketValidators, requireAuth, validateRequest, async (req: Request, res: Response): Promise<void> => {
  const { title, price } = req.body as { title: string, price: string }
  const newTicket = Ticket.build({
    title,
    price: +price,
    userId: req.currentUser!.id,
  })

  await newTicket.save()
  const publisher = new TicketCreatedPublisher(natsWrapper.client)
  // eslint-disable-next-line max-len
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-floating-promises
  publisher.publish({
    id: newTicket.id as string,
    title: newTicket.title,
    price: newTicket.price,
    userId: newTicket.userId,
    version: newTicket.version,
  })

  res.contentType('application/json')
    .status(201)
    .send(newTicket)
})

export { router as createTicketRouter }
