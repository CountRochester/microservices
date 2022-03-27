import { natsWrapper } from './nats-wrapper'
import { OrderCreatedListener } from './events/listeners/order-created-listener'

const envKeys = [
  'NATS_CLUSTER_ID',
  'NATS_CLIENT_ID',
  'NATS_URL',
  'REDIS_HOST',
]

const checkEnv = () => {
  envKeys.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`${key} must be defined`)
    }
  })
}

const start = async (): Promise<void> => {
  try {
    checkEnv()
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID!,
      process.env.NATS_CLIENT_ID!,
      process.env.NATS_URL!,
    )
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!')
      process.exit()
    })
    process.on('SIGINT', () => natsWrapper.client.close())
    process.on('SIGTERM', () => natsWrapper.client.close())

    new OrderCreatedListener(natsWrapper.client).listen()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start().catch(console.error)
