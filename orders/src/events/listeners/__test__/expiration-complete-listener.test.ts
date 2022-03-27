import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { ExpirationCompleteEvent } from '@cr-tickets/common'
import { ExpirationCompleteListener } from '../expiration-complete-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Ticket, TicketDocument } from '../../../models/ticket'
import { Order, OrderDocument } from '../../../models/orders'

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client)
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price: 20,
  })

  await ticket.save()

  const order = Order.build({
    status: 'created',
    userId: 'sdmhfjf',
    expiresAt: new Date(Date.now() + 1000 * 60),
    ticket,
  })

  await order.save()

  const data: ExpirationCompleteEvent['data'] = {
    orderId: String(order.id),
  }
  const msg = {
    ack: jest.fn(),
  } as unknown as Message
  return {
    listener, data, msg, ticket, order,
  }
}

test('Should updates the status to cancelled', async () => {
  const {
    listener, data, msg, order,
  } = await setup()
  await listener.onMessage(data, msg)

  const updatedOrder = await Order.findById(order.id) as OrderDocument
  expect(updatedOrder).toBeDefined()
  expect(updatedOrder.status).toBe('cancelled')
})

test('should emits an OrderCancelled event', async () => {
  const {
    listener, data, msg, order,
  } = await setup()
  await listener.onMessage(data, msg)

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(natsWrapper.client.publish).toHaveBeenCalledWith(
    'order:cancelled',
    JSON.stringify({
      id: String(order.id),
      version: order.version,
      ticket: order.ticket,
    }),
    expect.anything(),
  )
})

test('Should acks the message', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(msg.ack).toHaveBeenCalled()
})
