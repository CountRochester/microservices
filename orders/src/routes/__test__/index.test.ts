/* eslint-disable @typescript-eslint/unbound-method */
import request from 'supertest'
import mongoose from 'mongoose'
import app from '../../app'
import { Ticket } from '../../models/ticket'
import { Order, OrderAttrs } from '../../models/orders'

test('Should has a route handler listening to /api/orders fro post request', async () => {
  const response = await request(app)
    .get('/api/orders')
    .send()

  expect(response.status).toBe(401)
})

test('Should fetch orders for a particular user', async () => {
  const ticketId1 = new mongoose.Types.ObjectId().toHexString()
  const ticketId2 = new mongoose.Types.ObjectId().toHexString()
  const ticketId3 = new mongoose.Types.ObjectId().toHexString()
  const ticket1 = Ticket.build({
    title: 'test1',
    price: 500,
    id: ticketId1,
  })
  await ticket1.save()
  const ticket2 = Ticket.build({
    title: 'test2',
    price: 600,
    id: ticketId2,
  })
  await ticket2.save()
  const ticket3 = Ticket.build({
    title: 'test3',
    price: 700,
    id: ticketId3,
  })
  await ticket3.save()

  const order1 = Order.build({
    userId: 'test',
    ticket: ticket1,
    status: 'created',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
  })
  await order1.save()
  const order2 = Order.build({
    userId: 'kshdksjdf',
    ticket: ticket1,
    status: 'created',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
  })
  await order2.save()
  const order3 = Order.build({
    userId: 'test',
    ticket: ticket1,
    status: 'created',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
  })
  await order3.save()

  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', global.signin())
    .send()
    .expect(200)

  const body = response.body as OrderAttrs[]
  expect(body).toBeInstanceOf(Array)
  expect(body.length).toBe(2)
})
