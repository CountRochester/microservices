/* eslint-disable @typescript-eslint/unbound-method */
import request from 'supertest'
import mongoose from 'mongoose'
import app from '../../app'
import { Ticket } from '../../models/ticket'
import { Order, OrderDocument } from '../../models/orders'
import { natsWrapper } from '../../nats-wrapper'

test('Should has a route handler listening to /api/orders for delete request', async () => {
  const orderId = new mongoose.Types.ObjectId().toHexString()
  const response = await request(app)
    .delete(`/api/orders/${orderId}`)
    .send()

  expect(response.status).toBe(401)
})

test('Should cancel order', async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString()
  const ticket = Ticket.build({
    title: 'test1',
    price: 500,
    id: ticketId,
  })
  await ticket.save()

  const order = Order.build({
    userId: 'test',
    ticket,
    status: 'created',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
  })
  await order.save()

  await request(app)
    .delete(`/api/orders/${String(order.id)}`)
    .set('Cookie', global.signin())
    .send()
    .expect(204)

  const updatedOrder = await Order.findById(order.id)
  expect(updatedOrder?.status).toBe('cancelled')
})

test('Should returns an error if one user tries to delete another users order', async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString()
  const ticket = Ticket.build({
    title: 'test1',
    price: 500,
    id: ticketId,
  })
  await ticket.save()

  const order = Order.build({
    userId: 'mksahdkjhk',
    ticket,
    status: 'created',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
  })
  await order.save()

  await request(app)
    .delete(`/api/orders/${String(order.id)}`)
    .set('Cookie', global.signin())
    .send()
    .expect(401)
})

test('Should emits an order cancelled event', async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString()
  const ticket = Ticket.build({
    title: 'test1',
    price: 500,
    id: ticketId,
  })
  await ticket.save()

  const order = Order.build({
    userId: 'test',
    ticket,
    status: 'created',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
  })
  await order.save()

  await request(app)
    .delete(`/api/orders/${String(order.id)}`)
    .set('Cookie', global.signin())
    .send()
    .expect(204)

  expect(natsWrapper.client.publish).toBeCalled()
})
