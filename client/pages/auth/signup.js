import { useState } from 'react'
import Router from 'next/router'
import useRequest from '../../hooks/use-request'

const SignUp = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { doRequest, errors } = useRequest()

  const onSubmit = async (event) => {
    event.preventDefault()
    const response = await doRequest({
      url: '/api/users/signup',
      body: { email, password },
      method: 'post',
    })

    if (response) {
      Router.push('/')
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <h1>Sign Up</h1>
      <div className='form-group my-4'>
        <label>Email Address</label>
        <input
          value={email}
          className='form-control'
          onChange={e => setEmail(e.target.value)}
        />
      </div>

      <div className='form-group my-4'>
        <label>Password</label>
        <input
          value={password}
          type="password"
          className='form-control'
          onChange={e => setPassword(e.target.value)}
        />
      </div>

      {errors}

      <button className='btn btn-primary'>Sign up</button>
    </form>
  )
}

export default SignUp