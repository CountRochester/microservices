/* eslint-disable @typescript-eslint/unbound-method */
import request from 'supertest'
import mongoose from 'mongoose'
import app from '../../app'
import { Ticket } from '../../models/ticket'
import { Order, OrderDocument } from '../../models/orders'

test('Should has a route handler listening to /api/orders fro post request', async () => {
  const orderId = new mongoose.Types.ObjectId().toHexString()
  const response = await request(app)
    .get(`/api/orders/${orderId}`)
    .send()

  expect(response.status).toBe(401)
})

test('Should fetch orders for a particular user', async () => {
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

  const response = await request(app)
    .get(`/api/orders/${String(order.id)}`)
    .set('Cookie', global.signin())
    .send()
    .expect(200)

  const body = response.body as OrderDocument
  expect(body.id).toBe(order.id)
})

test('Should returns an error if one user tries to fetch another users order', async () => {
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
    .get(`/api/orders/${String(order.id)}`)
    .set('Cookie', global.signin())
    .send()
    .expect(401)
})
