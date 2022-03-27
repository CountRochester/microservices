/* eslint-disable @typescript-eslint/unbound-method */
import request from 'supertest'
import app from '../../app'
import { Ticket, TicketDocument } from '../../models/ticket'
import { natsWrapper } from '../../nats-wrapper'

test('Should has a route handler listening to /api/tickets fro post request', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .send({})

  expect(response.status).not.toBe(404)
})

test('Should can only be accessed if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .send({})

  expect(response.status).toBe(401)
})

test('Should not return 401 if the user is signed in', async () => {
  const cookie = global.signin()
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({})

  expect(response.status).not.toBe(401)
})

test('Should returns an error if invalid title is provided', async () => {
  const cookie = global.signin()
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: '',
      price: '10',
    })

  expect(response.status).toBe(400)
})

test('Should returns an error if invalid price is provided', async () => {
  const cookie = global.signin()
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Test',
      price: '1df0',
    })

  expect(response.status).toBe(400)
})

test('Should creates a valid ticket', async () => {
  const allTickets = await Ticket.find({})
  expect(allTickets.length).toBe(0)
  const newTicket = {
    title: 'Test',
    price: '10',
  }
  const cookie = global.signin()
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send(newTicket)
    .expect(201)

  const body = response.body as unknown as TicketDocument

  expect(typeof body.id).toBe('string')
  expect(body.title).toBe(newTicket.title)
  expect(body.price).toBe(+newTicket.price)
  expect(body.userId).toBe('test')
  const tickets = await Ticket.find({})
  expect(tickets.length).toBe(1)
  expect(tickets[0].title).toBe(newTicket.title)
  expect(tickets[0].price).toBe(+newTicket.price)
  expect(tickets[0].userId).toBe('test')
})

test('publishes an event', async () => {
  const newTicket = {
    title: 'Test',
    price: '10',
  }
  const cookie = global.signin()
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send(newTicket)
    .expect(201)

  expect(natsWrapper.client.publish).toBeCalled()
})
