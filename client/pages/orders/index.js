import Router from 'next/router'

const IndexPage = ({ currentUser, orders }) => {
  const drawButton = order => {
    const openOrder = e => {
      e.preventDefault()
      Router.push('/orders/[orderId]', `/orders/${order.id}`)
    }
    if (order.status === 'created') {
      return (
        <button className="btn btn-primary" onClick={openOrder}>Make payment</button>
      )
    }
    return order.status
  }

  const ticketList = orders.map(order => {
    return (
      <tr key={order.id}>
        <td>{ order.ticket.title }</td>
        <td>{ order.ticket.price }</td>
        <td>{drawButton(order)}</td>
      </tr>
    )
  })
  
  return (
    <div>
      <h1>Orders</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {ticketList}
        </tbody>
      </table>
    </div>
  )
}

IndexPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/orders')
  return { orders: data }
}

export default IndexPage
