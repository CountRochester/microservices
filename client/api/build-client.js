import axios from 'axios'

export default ({ req, ctx }) => {
  if (typeof window === 'undefined') {
    const headers = req
      ? req.headers
      : ctx.req.headers
    
    return axios.create({
      baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers
    })
  } else {
    return axios.create({
      baseURL: '/',
    })
  }
}
