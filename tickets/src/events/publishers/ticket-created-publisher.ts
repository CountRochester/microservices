import { TicketCreatedEvent, Publisher } from '@cr-tickets/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = 'ticket:created'
}
