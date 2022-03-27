import mongoose from 'mongoose'
import request from 'supertest'
import { orderStatuses } from '@cr-tickets/common'
import { app } from '../../app'
import { Order } from '../../models/order'
import { stripe } from '../../stripe'
import { Payment } from '../../models/payment'

it('returns a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'asldkfj',
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404)
  return
})

it('returns a 401 when purchasing an order that doesnt belong to the user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: orderStatuses[0],
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'asldkfj',
      orderId: order.id,
    })
    .expect(401)
  return
})

it('returns a 400 when purchasing a cancelled order', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: 'test',
    version: 0,
    price: 20,
    status: orderStatuses[1],
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      orderId: order.id,
      token: 'asdlkfj',
    })
    .expect(400)
  return
})

it('returns a 201 with valid inputs', async () => {
  const price = Math.floor(Math.random() * 100000)
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: 'test',
    version: 0,
    price,
    status: orderStatuses[0],
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201)

  const stripeCharges = await stripe.charges.list({ limit: 50 })
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100
  })

  expect(stripeCharge).toBeDefined()
  expect(stripeCharge!.currency).toEqual('usd')

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  })
  expect(payment).not.toBeNull()
  return
})
