import { Message } from 'node-nats-streaming'
import { Listener, TicketUpdatedEvent } from '@cr-tickets/common'
import { Ticket } from '../../models/ticket'
import { QUEUE_GROUP_NAME } from './queue-group-name'

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = 'ticket:updated'

  readonly queueGroupName = QUEUE_GROUP_NAME

  // eslint-disable-next-line class-methods-use-this
  async onMessage(data: TicketUpdatedEvent['data'], msg: Message): Promise<void> {
    const { title, price, version } = data
    const ticket = await Ticket.findByEvent(data)
    if (!ticket) {
      throw new Error('Ticket not found')
    }
    ticket.set({ title, price, version })
    await ticket.save()
    msg.ack()
  }
}
