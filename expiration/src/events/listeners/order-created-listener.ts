import { Message } from 'node-nats-streaming'
import { Listener, OrderCreatedEvent } from '@cr-tickets/common'
import { QUEUE_GROUP_NAME } from './queue-group-name'
import { expirationQueue } from '../../queues/expiration-queue'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = 'order:created'

  readonly queueGroupName = QUEUE_GROUP_NAME

  // eslint-disable-next-line class-methods-use-this
  async onMessage(data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
    const { id, expiresAt } = data
    const delay = new Date(expiresAt).getTime() - new Date().getTime()
    await expirationQueue.add({ orderId: id }, { delay })
    msg.ack()
  }
}
