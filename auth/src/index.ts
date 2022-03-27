import mongoose from 'mongoose'
import app from './app'

const checkEnv = () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined')
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined')
  }
}

const start = async (): Promise<void> => {
  try {
    checkEnv()
    await mongoose.connect(process.env.MONGO_URI!)
    console.log('Connected to mongoDB')
    app.listen(3000, (): void => {
      console.log('Auth app is running on port 3000!!!')
    })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start().catch(console.error)
