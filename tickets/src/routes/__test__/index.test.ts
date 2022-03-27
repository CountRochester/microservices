import request from 'supertest'
import app from '../../app'
import { Ticket, TicketDocument } from '../../models/ticket'

test('Should returns tickets', async () => {
  const newTicket1 = {
    title: 'Test1',
    price: '10',
  }
  const newTicket2 = {
    title: 'Test2',
    price: '20',
  }
  const newTicket3 = {
    title: 'Test3',
    price: '30',
  }
  const allTickets = await Ticket.find({})
  expect(allTickets.length).toBe(0)

  const cookie = global.signin()
  const addResponse1 = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send(newTicket1)
    .expect(201)
  const addResponse2 = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send(newTicket2)
    .expect(201)
  const addResponse3 = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send(newTicket3)
    .expect(201)

  const response = await request(app)
    .get('/api/tickets')
    .send()
    .expect(200)

  const body = response.body as unknown as Array<TicketDocument>
  expect(body).toBeInstanceOf(Array)
  expect(body.length).toBe(3)
})
