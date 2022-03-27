import { Message, Stan } from 'node-nats-streaming'
import { Subjects } from './subjects'

export interface NatsEvent {
  subject: Subjects
  data: any
}

export abstract class Listener<T extends NatsEvent> {
  abstract subject: T['subject']

  abstract queueGroupName: string

  abstract onMessage(data: T['data'], msg: Message): void

  private client: Stan

  protected ackWait = 5 * 1000

  constructor(client: Stan) {
    this.client = client
  }

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName)
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject as string,
      this.queueGroupName,
      this.subscriptionOptions(),
    )

    subscription.on('message', (msg: Message) => {
      console.log(
        `Message received: ${this.subject as string} / ${this.queueGroupName}`,
      )

      const parsedData = this.parseMessage(msg)
      this.onMessage(parsedData, msg)
    })
  }

  // eslint-disable-next-line class-methods-use-this
  parseMessage(msg: Message): T['data'] {
    const data = msg.getData()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const output = typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf-8'))

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return output as unknown as T['data']
  }
}
