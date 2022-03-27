import nats from 'node-nats-streaming'
import { TicketCreatedPublisher } from './events/ticket-created-publisher'

console.clear()

const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
stan.on('connect', async () => {
  console.log('Publisher connected to NATS')

  const publisher = new TicketCreatedPublisher(stan)

  await publisher.publish({
    id: '123',
    title: 'concert',
    price: 20,
  })
})
