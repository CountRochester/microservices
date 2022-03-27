import { Publisher, OrderCreatedEvent } from '@cr-tickets/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = 'order:created'
}
