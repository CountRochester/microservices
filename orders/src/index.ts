import mongoose from 'mongoose'
import app from './app'
import { natsWrapper, NatsWrapper } from './nats-wrapper'
import { TicketCreatedListener } from './events/listeners/ticket-created-listener'
import { PaymentCreatedListener } from './events/listeners/payment-created-listener'
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener'
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener'

const envKeys = [
  'JWT_KEY',
  'MONGO_URI',
  'NATS_CLUSTER_ID',
  'NATS_CLIENT_ID',
  'NATS_URL',
]

const checkEnv = () => {
  envKeys.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`${key} must be defined`)
    }
  })
}

const initListeners = (wrapper: NatsWrapper) => {
  new TicketCreatedListener(wrapper.client).listen()
  new TicketUpdatedListener(wrapper.client).listen()
  new ExpirationCompleteListener(wrapper.client).listen()
  new PaymentCreatedListener(wrapper.client).listen()
}

const start = async (): Promise<void> => {
  try {
    checkEnv()
    await mongoose.connect(process.env.MONGO_URI!)
    console.log('Connected to mongoDB')
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

    initListeners(natsWrapper)

    app.listen(3000, (): void => {
      console.log('Orders app is running on port 3000!!!')
    })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start().catch(console.error)
