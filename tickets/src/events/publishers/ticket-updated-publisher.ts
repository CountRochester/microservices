import { TicketUpdatedEvent, Publisher } from '@cr-tickets/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = 'ticket:updated'
}
