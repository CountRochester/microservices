import { Publisher, OrderCancelledEvent } from '@cr-tickets/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = 'order:cancelled'
}
