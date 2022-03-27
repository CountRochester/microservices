import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { OrderCreatedEvent } from '@cr-tickets/common'
import { OrderCreatedListener } from '../order-created-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/ticket'

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client)

  const ticket = Ticket.build({
    title: 'concert',
    price: 500,
    userId: 'test',
  })

  await ticket.save()

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: 'created',
    userId: 'test',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    ticket: {
      id: String(ticket.id),
      price: ticket.price,
    },
  }

  const msg = {
    ack: jest.fn(),
  } as unknown as Message

  return {
    listener,
    ticket,
    data,
    msg,
  }
}

test('should sets the userId of the ticket', async () => {
  const {
    listener, ticket, data, msg,
  } = await setup()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket).toBeDefined()
  expect(updatedTicket!.orderId).toBe(data.id)
})

test('should acks the message', async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(msg.ack).toHaveBeenCalled()
})

test('should publish ticket update event', async () => {
  const {
    listener, data, msg, ticket,
  } = await setup()

  await listener.onMessage(data, msg)

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(msg.ack).toHaveBeenCalled()
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(natsWrapper.client.publish).toHaveBeenCalledWith('ticket:updated', JSON.stringify(
    {
      id: String(ticket.id),
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: data.id,
      version: ticket.version + 1,
    },
  ), expect.anything())
})
