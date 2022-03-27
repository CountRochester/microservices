import { Message } from 'node-nats-streaming'
import { Listener, ExpirationCompleteEvent } from '@cr-tickets/common'
import { Order, OrderDocument } from '../../models/orders'
import { QUEUE_GROUP_NAME } from './queue-group-name'
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher'

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = 'expiration:complete'

  readonly queueGroupName = QUEUE_GROUP_NAME

  // eslint-disable-next-line class-methods-use-this
  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message): Promise<void> {
    const { orderId } = data
    const order = await Order.findById(orderId).populate('ticket') as OrderDocument
    if (!order) {
      throw new Error('Order not found')
    }
    order.status = 'cancelled'
    await order.save()
    await new OrderCancelledPublisher(this.client).publish({
      id: String(order.id),
      version: order.version,
      ticket: order.ticket,
    })
    msg.ack()
  }
}
