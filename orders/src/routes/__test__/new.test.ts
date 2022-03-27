/* eslint-disable @typescript-eslint/unbound-method */
import request from 'supertest'
import mongoose from 'mongoose'
import app from '../../app'
import { Ticket, TicketDocument } from '../../models/ticket'
import { Order } from '../../models/orders'
import { natsWrapper } from '../../nats-wrapper'

test('Should has a route handler listening to /api/orders fro post request', async () => {
  const response = await request(app)
    .post('/api/orders')
    .send({})

  expect(response.status).not.toBe(404)
})

test('Should returns an error if ticket does not exist', async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId })
    .expect(404)
})

test('Should returns an error if ticket already reserved', async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString()
  const ticket = Ticket.build({
    title: 'test',
    price: 500,
    id: ticketId,
  })
  await ticket.save()

  const order = Order.build({
    userId: 'sdfsdfst',
    ticket,
    status: 'created',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
  })
  await order.save()

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id as string })
    .expect(400)
})

test('Should reserve a ticket', async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString()
  const ticket = Ticket.build({
    title: 'test',
    price: 500,
    id: ticketId,
  })
  await ticket.save()

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id as string })
    .expect(201)
})

test('Should emits an order created event', async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString()
  const ticket = Ticket.build({
    title: 'test',
    price: 500,
    id: ticketId,
  })
  await ticket.save()

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id as string })
    .expect(201)

  expect(natsWrapper.client.publish).toBeCalled()
})
