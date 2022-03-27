import { useState } from 'react'
import Router from 'next/router'
import useRequest from '../../hooks/use-request'

const NewTicket = () => {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const { doRequest, errors } = useRequest()

  

  const onBlur = () => {
    const value = parseFloat(price)
    if (Number.isNaN(value)) {
      setPrice(0)
      return
    }
    setPrice(value.toFixed(2))
  }

  const onSubmit = async e => {
    e.preventDefault()
    try {
      const ticket = await doRequest({
        url: '/api/tickets',
        method: 'post',
        body: {
          title, price
        },
      })
      if (!ticket) {
        throw new Error('Error creating ticket')
      }
      setTitle('')
      setPrice('')
      Router.push('/tickets/[ticketId]', `/tickets/${ticket.id}`)
    } catch (err) {
      console.log(err.message)
    }
  }

  return (
    <div>
      <h1>Create a ticket</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group" >
          <label>Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="form-group mb-4" >
          <label>Price</label>
          <input
            value={price}
            onBlur={onBlur}
            onChange={e => setPrice(e.target.value)}
            className="form-control"
          />
        </div>
        {errors}
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  )
}

export default NewTicket