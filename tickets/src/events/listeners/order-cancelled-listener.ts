import { Message } from 'node-nats-streaming'
import { Listener, OrderCancelledEvent } from '@cr-tickets/common'
import { Ticket, TicketDocument } from '../../models/ticket'
import { QUEUE_GROUP_NAME } from './queue-group-name'
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher'

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = 'order:cancelled'

  readonly queueGroupName = QUEUE_GROUP_NAME

  // eslint-disable-next-line class-methods-use-this
  async onMessage(data: OrderCancelledEvent['data'], msg: Message): Promise<void> {
    const { ticket } = data
    const existingTicket = await Ticket.findById(ticket.id) as TicketDocument

    if (!existingTicket) {
      throw new Error('Ticket not found')
    }

    existingTicket.set({ orderId: undefined })
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
