import request from 'supertest'
import app from '../../app'
import { TicketDocument } from '../../models/ticket'

test('Should returns 404 if ticket not found', async () => {
  await request(app)
    .get('/api/tickets/hfhgfhgd')
    .send()
    .expect(404)
})

test('Should returns ticket if found', async () => {
  const newTicket = {
    title: 'Test',
    price: '10',
  }
  const cookie = global.signin()
  const addResponse = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send(newTicket)
    .expect(201)

  const addedTicket = addResponse.body as unknown as TicketDocument

  const response = await request(app)
    .get(`/api/tickets/${addedTicket.id as string}`)
    .send()
    .expect(200)

  expect(response.body).toEqual(addedTicket)
})
