/* eslint-disable @typescript-eslint/unbound-method */
import request from 'supertest'
import mongoose from 'mongoose'
import app from '../../app'
import { Ticket, TicketDocument } from '../../models/ticket'
import { natsWrapper } from '../../nats-wrapper'

test('Should returns 404 for ticket that does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  const cookie = global.signin()
  const response = await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', cookie)
    .send({
      title: 'Test',
      price: '20',
    })

  expect(response.status).toBe(404)
})

test('Should can only be accessed if the user is signed in', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  const response = await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'Test',
      price: '20',
    })

  expect(response.status).toBe(401)
})

test('Should return 401 if the user not own the ticket', async () => {
  const allTickets = await Ticket.find({})
  expect(allTickets.length).toBe(0)
  const newTicket = {
    title: 'Test',
    price: '10',
  }
  const cookie1 = global.signin()

  const responseCreate = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie1)
    .send(newTicket)
    .expect(201)
  const ticket = responseCreate.body as unknown as TicketDocument

  const cookie2 = global.signin({ email: 'test2@test.com', id: 'test2' })
  const response = await request(app)
    .put(`/api/tickets/${ticket.id as string}`)
    .set('Cookie', cookie2)
    .send({
      title: 'Test2',
      price: '40',
    })

  expect(response.status).toBe(401)
})

test('Should returns an error if invalid title is provided', async () => {
  const allTickets = await Ticket.find({})
  expect(allTickets.length).toBe(0)
  const newTicket = {
    title: 'Test',
    price: '10',
  }
  const cookie = global.signin()

  const responseCreate = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send(newTicket)
    .expect(201)
  const ticket = responseCreate.body as unknown as TicketDocument

  const response = await request(app)
    .put(`/api/tickets/${ticket.id as string}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: '10',
    })

  expect(response.status).toBe(400)
})

test('Should returns an error if invalid price is provided', async () => {
  const allTickets = await Ticket.find({})
  expect(allTickets.length).toBe(0)
  const newTicket = {
    title: 'Test',
    price: '10',
  }
  const cookie = global.signin()

  const responseCreate = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send(newTicket)
    .expect(201)
  const ticket = responseCreate.body as unknown as TicketDocument

  const response = await request(app)
    .put(`/api/tickets/${ticket.id as string}`)
    .set('Cookie', cookie)
    .send({
      title: 'Test',
      price: '10sdf',
    })

  expect(response.status).toBe(400)
})

test('Should updates a valid ticket', async () => {
  const allTickets = await Ticket.find({})
  expect(allTickets.length).toBe(0)
  const newTicket = {
    title: 'Test',
    price: '10',
  }
  const cookie = global.signin()
  const createResponse = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send(newTicket)
    .expect(201)

  const ticket = createResponse.body as unknown as TicketDocument

  const updatedTicket = {
    title: 'Test',
    price: '40.5',
  }
  const response = await request(app)
    .put(`/api/tickets/${ticket.id as string}`)
    .set('Cookie', cookie)
    .send(updatedTicket)

  const body = response.body as unknown as TicketDocument

  expect(typeof body.id).toBe('string')
  expect(body.title).toBe(updatedTicket.title)
  expect(body.price).toBe(+updatedTicket.price)
  expect(body.userId).toBe('test')
  const tickets = await Ticket.find({})
  expect(tickets.length).toBe(1)
  expect(tickets[0].title).toBe(updatedTicket.title)
  expect(tickets[0].price).toBe(+updatedTicket.price)
  expect(tickets[0].userId).toBe('test')
})

test('publishes an event', async () => {
  const allTickets = await Ticket.find({})
  expect(allTickets.length).toBe(0)
  const newTicket = {
    title: 'Test',
    price: '10',
  }
  const cookie = global.signin()
  const createResponse = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send(newTicket)
    .expect(201)

  const ticket = createResponse.body as unknown as TicketDocument

  const updatedTicket = {
    title: 'Test',
    price: '40.5',
  }
  const response = await request(app)
    .put(`/api/tickets/${ticket.id as string}`)
    .set('Cookie', cookie)
    .send(updatedTicket)

  expect(natsWrapper.client.publish).toBeCalledTimes(2)
})

test('Should returns an error if the ticket is reserved', async () => {
  const newTicket = {
    title: 'Test',
    price: '10',
  }
  const cookie = global.signin()
  const createResponse = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send(newTicket)
    .expect(201)

  const ticket = await Ticket.findById((createResponse.body as unknown as TicketDocument).id)
  ticket!.set({
    orderId: new mongoose.Types.ObjectId().toHexString(),
  })
  await ticket!.save()

  const updatedTicket = {
    title: 'Test',
    price: '40.5',
  }
  await request(app)
    .put(`/api/tickets/${String(ticket!.id)}`)
    .set('Cookie', cookie)
    .send(updatedTicket)
    .expect(400)
})
