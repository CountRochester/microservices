import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { TicketUpdatedEvent } from '@cr-tickets/common'
import { TicketUpdatedListener } from '../ticket-updated-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Ticket, TicketDocument } from '../../../models/ticket'

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client)
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price: 20,
  })

  await ticket.save()

  const data: TicketUpdatedEvent['data'] = {
    id: String(ticket.id),
    title: 'concert',
    price: 10,
    userId: 'test',
    version: ticket.version + 1,
  }
  const msg = {
    ack: jest.fn(),
  } as unknown as Message
  return {
    listener, data, msg, ticket,
  }
}

test('Should finds, updates and saves a ticket', async () => {
  const {
    listener, data, msg, ticket,
  } = await setup()
  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id) as TicketDocument
  expect(updatedTicket).toBeDefined()
  expect(updatedTicket.title).toBe(data.title)
  expect(updatedTicket.price).toBe(data.price)
  expect(updatedTicket.version).toBe(data.version)
})

test('Should acks the message', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(msg.ack).toHaveBeenCalled()
})

test('should not call ack if event has the wrong version', async () => {
  const {
    listener, data, msg, ticket,
  } = await setup()

  data.version = 10
  await expect(listener.onMessage(data, msg)).rejects.toThrow()
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(msg.ack).not.toHaveBeenCalled()
})
