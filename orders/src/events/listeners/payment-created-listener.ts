import { Message } from 'node-nats-streaming'
import { Listener, PaymentCreatedEvent } from '@cr-tickets/common'
import { Order } from '../../models/orders'
import { QUEUE_GROUP_NAME } from './queue-group-name'

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = 'payment:created'

  readonly queueGroupName = QUEUE_GROUP_NAME

  // eslint-disable-next-line class-methods-use-this
  async onMessage(data: PaymentCreatedEvent['data'], msg: Message): Promise<void> {
    const { orderId } = data
    const order = await Order.findById(orderId)
    if (!order) {
      throw new Error('Order not found')
    }
    order.status = 'complete'
    await order.save()
    msg.ack()
  }
}
