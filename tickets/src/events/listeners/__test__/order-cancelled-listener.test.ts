import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { OrderCancelledEvent } from '@cr-tickets/common'
import { OrderCancelledListener } from '../order-cancelled-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/ticket'

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client)
  const orderId = new mongoose.Types.ObjectId().toHexString()

  const ticket = Ticket.build({
    title: 'concert',
    price: 500,
    userId: 'test',
    orderId,
  })

  await ticket.save()

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 1,
    ticket: {
      id: String(ticket.id),
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

test('should updates the ticket, publishes an event and acks the message', async () => {
  const {
    listener, ticket, data, msg,
  } = await setup()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket).toBeDefined()
  expect(updatedTicket!.orderId).not.toBeDefined()

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(msg.ack).toHaveBeenCalled()

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(natsWrapper.client.publish).toHaveBeenCalledWith('ticket:updated', JSON.stringify(
    {
      id: String(ticket.id),
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version + 1,
    },
  ), expect.anything())
})
