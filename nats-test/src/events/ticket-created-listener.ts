import { Message } from 'node-nats-streaming'
import { Listener } from './base-listener'
import { TicketCreatedEvent } from './ticket-created-event'

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = 'ticket:created'

  readonly queueGroupName = 'payments-service'

  // eslint-disable-next-line class-methods-use-this
  onMessage(data: TicketCreatedEvent['data'], msg: Message): void {
    console.log('Event data!', data)

    msg.ack()
  }
}
