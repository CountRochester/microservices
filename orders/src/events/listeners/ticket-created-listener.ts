import { Message } from 'node-nats-streaming'
import { Listener, TicketCreatedEvent } from '@cr-tickets/common'
import { Ticket } from '../../models/ticket'
import { QUEUE_GROUP_NAME } from './queue-group-name'

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = 'ticket:created'

  readonly queueGroupName = QUEUE_GROUP_NAME

  // eslint-disable-next-line class-methods-use-this
  async onMessage(data: TicketCreatedEvent['data'], msg: Message): Promise<void> {
    const { title, price, id } = data
    const ticket = Ticket.build({ id, title, price })
    await ticket.save()
    msg.ack()
  }
}
