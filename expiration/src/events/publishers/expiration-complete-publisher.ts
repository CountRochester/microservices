import { Publisher, ExpirationCompleteEvent } from '@cr-tickets/common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = 'expiration:complete'
}
