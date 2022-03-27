import { Publisher, PaymentCreatedEvent } from '@cr-tickets/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = 'payment:created'
}
