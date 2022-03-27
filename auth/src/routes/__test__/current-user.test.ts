import request from 'supertest'
import app from '../../app'

test('should returns a 200 on successful signin', async () => {
  const cookie = await global.signin()

  const curUserResponse = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200)

  expect(curUserResponse.body).toEqual({
    currentUser: {
      email: 'test@test.com',
      iat: expect.anything() as string,
      id: expect.anything() as string,
    },

  })
})

test('should returns a null if not authenticated', async () => {
  const curUserResponse = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200)

  expect(curUserResponse.body).toEqual({
    currentUser: null,
  })
})
