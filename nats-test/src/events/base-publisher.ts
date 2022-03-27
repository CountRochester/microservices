import { Stan } from 'node-nats-streaming'
import { NatsEvent } from './base-listener'

export abstract class Publisher<T extends NatsEvent> {
  abstract subject: T['subject']

  private client: Stan

  constructor(client: Stan) {
    this.client = client
  }

  publish(data: T['data']): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.publish(this.subject as string, JSON.stringify(data), (err) => {
        if (err) {
          reject(err)
        }
        console.log('Event published to subject', this.subject)
        resolve()
      })
    })
  }
}
