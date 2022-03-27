import mongoose from 'mongoose'
import { app } from './app'
import { natsWrapper, NatsWrapper } from './nats-wrapper'
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener'
import { OrderCreatedListener } from './events/listeners/order-created-listener'

const envKeys = [
  'JWT_KEY',
  'MONGO_URI',
  'NATS_CLUSTER_ID',
  'NATS_CLIENT_ID',
  'NATS_URL',
  'STRIPE_KEY'
]

const checkEnv = () => {
  envKeys.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`${key} must be defined`)
    }
  })
}

const initListeners = (wrapper: NatsWrapper) => {
  new OrderCreatedListener(natsWrapper.client).listen()
    new OrderCancelledListener(natsWrapper.client).listen()
}

const start = async () => {
  try {
    checkEnv()
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID as string,
      process.env.NATS_CLIENT_ID as string,
      process.env.NATS_URL as string
    );
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!')
      process.exit()
    })
    process.on('SIGINT', () => natsWrapper.client.close())
    process.on('SIGTERM', () => natsWrapper.client.close())
    initListeners(natsWrapper)
    await mongoose.connect(process.env.MONGO_URI!)
    console.log('Connected to MongoDb')

    app.listen(3000, () => {
      console.log('Payment is listening on port 3000!!!!!!!!')
    })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()
