import { useState } from 'react'
import axios from 'axios'

const useRequest = () => {
  const [errors, setErrors] = useState([])

  const doRequest = async ({ url, method, body }) => {
    try {
      setErrors(null)
      const { data } = await axios[method](url, body)
      return data
    } catch (err) {
      if (err?.response?.data?.errors) {
        setErrors(
          <div className='alert alert-danger'>
            <h4>Ooops....</h4>
            <ul>
              {err.response.data.errors.map((error, index) => (
                <li key={error.message + index} >{error.message}</li>
              ))}
            </ul>
          </div>
        )
      } else {
        setErrors(
          <div className='alert alert-danger'>
            <h4>Ooops....</h4>
            <ul>
              {<li>{err.message}</li>}
            </ul>
          </div>
        )
      }
    }
  }

  return { errors, doRequest }
}

export default useRequest
