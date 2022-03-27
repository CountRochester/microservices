import Router from 'next/router'
import useRequest from '../../hooks/use-request'

const TicketComponent = ({ ticket }) => {
  const { doRequest, errors } = useRequest()

  const purchase = async () => {
    try {
      const order = await doRequest({
        url: '/api/orders',
        method: 'post',
        body: {
          ticketId: ticket.id
        }
      })

      if (!ticket) {
        throw new Error('Error creating an order')
      }
      Router.push('/orders/[orderId]', `/orders/${order.id}`)
    } catch (err) {
      console.log(err.message)
    }
  }

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: { ticket.price }</h4>
      <h4>Status: </h4>
      {errors}
      <button className="btn btn-primary" onClick={purchase}>Purchase</button>
    </div>
  )
}

TicketComponent.getInitialProps = async (context, client) => {
  const { ticketId } = context.query
  const { data } = await client.get(`/api/tickets/${ticketId}`)

  return { ticket: data }
}

export default TicketComponent