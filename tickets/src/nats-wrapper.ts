/* eslint-disable no-underscore-dangle */
import nats, { Stan } from 'node-nats-streaming'

export class NatsWrapper {
  private _client?: Stan

  get client(): Stan {
    if (!this._client) {
      throw new Error('Cannot access NATS client before connecting')
    }

    return this._client
  }

  connect(clusterId: string, clientId: string, url: string): Promise<void> {
    this._client = nats.connect(clusterId, clientId, { url })

    return new Promise((resolve, reject) => {
      this._client!.on('connect', () => {
        console.log('Connected to Nats')
        resolve()
      })

      this._client!.on('error', reject)
    })
  }
}

export const natsWrapper = new NatsWrapper()
