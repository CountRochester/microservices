import { Message } from 'node-nats-streaming'
import { Listener, OrderCreatedEvent } from '@cr-tickets/common'
import { Ticket, TicketDocument } from '../../models/ticket'
import { QUEUE_GROUP_NAME } from './queue-group-name'
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = 'order:created'

  readonly queueGroupName = QUEUE_GROUP_NAME

  // eslint-disable-next-line class-methods-use-this
  async onMessage(data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
    const { id, ticket } = data
    const existingTicket = await Ticket.findById(ticket.id) as TicketDocument

    if (!existingTicket) {
      throw new Error('Ticket not found')
    }

    existingTicket.set({ orderId: id })
    await existingTicket.save()

    await new TicketUpdatedPublisher(this.client).publish({
      id: String(existingTicket.id),
      title: existingTicket.title,
      price: existingTicket.price,
      userId: existingTicket.userId,
      orderId: existingTicket.orderId,
      version: existingTicket.version,
    })

    msg.ack()
  }
}
