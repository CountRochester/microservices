import { useEffect, useState } from 'react'
import Router from 'next/router'
import StripeCheckout from 'react-stripe-checkout'
import { STRIPE_KEY } from '../../config'
import useRequest from '../../hooks/use-request'

const OrderComponent = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0)
  const { doRequest, errors } = useRequest()

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date()
      setTimeLeft(Math.round(msLeft / 1000))
      
    }
    findTimeLeft()
    const timerId = setInterval(findTimeLeft, 1000)
    return () => {
      clearInterval(timerId)
    }
  }, [])

  if (timeLeft <= 0) {
    return (
      <div>Order expired</div>
    )
  }

  const onSuccessPay = async token => {
    try {
      const payment = await doRequest({
        url: '/api/payments',
        method: 'post',
        body: {
          orderId: order.id,
          token: token.id
        }
      })

      if (!payment) {
        throw new Error('Error creating a payment')
      }

      Router.push('/orders')
    } catch (err) {
      console.log(err.message)
    }
  }

  return (
    <div>
      <h1>Order</h1>
      <h2>{ timeLeft } seconds until order expires</h2>
      <h4>Price: { order.ticket.price }</h4>
      <h4>Status: {order.status}</h4>
      {errors}
      <StripeCheckout
        token={onSuccessPay}
        stripeKey={STRIPE_KEY}
        amount={order.ticket.price * 100}
        email={ currentUser.email }
      />
    </div>
  )
}

OrderComponent.getInitialProps = async (context, client) => {
  const { orderId } = context.query
  const { data } = await client.get(`/api/orders/${orderId}`)

  return { order: data }
}

export default OrderComponent