import { useEffect } from 'react'
import Router from 'next/router'
import useRequest from '../../hooks/use-request'

const SignOut = () => {
  const { doRequest } = useRequest()

  useEffect(() => {
    doRequest({
      url: '/api/users/signout',
      method: 'post',
      body: {}
    }).then(() => {
      Router.push('/')
    })
  }, [])

  return <div>Signing you out...</div>
}

export default SignOut