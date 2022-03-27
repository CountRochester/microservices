import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { TicketCreatedEvent } from '@cr-tickets/common'
import { TicketCreatedListener } from '../ticket-created-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/ticket'

const setup = () => {
  const listener = new TicketCreatedListener(natsWrapper.client)
  const data: TicketCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price: 10,
    userId: 'test',
    version: 0,
  }
  const msg = {
    ack: jest.fn(),
  } as unknown as Message
  return { listener, data, msg }
}

test('Should creates and saves a ticket', async () => {
  const { listener, data, msg } = setup()
  await listener.onMessage(data, msg)

  const ticket = await Ticket.findById(data.id)
  expect(ticket).toBeDefined()
  expect(ticket!.title).toBe(data.title)
  expect(ticket!.price).toBe(data.price)
})

test('Should acks the message', async () => {
  const { listener, data, msg } = setup()
  await listener.onMessage(data, msg)

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(msg.ack).toHaveBeenCalled()
})
