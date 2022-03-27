import request from 'supertest'
import app from '../../app'

test('should returns a 200 on successful signin', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201)
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(200)
})

test('should returns a 400 on invalid password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201)
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'dsfsdf',
    })
    .expect(400)
})

test('should returns a 400 for invalid email', async () => request(app)
  .post('/api/users/signin')
  .send({
    email: 'testtestcom',
    password: 'password',
  })
  .expect(400))

test('should returns a 400 for user not exists', async () => request(app)
  .post('/api/users/signin')
  .send({
    email: 'test@test.com',
    password: 'password',
  })
  .expect(400))

test('should returns a 400 for empty password', async () => request(app)
  .post('/api/users/signin')
  .send({
    email: 'test@test.com',
    password: '',
  })
  .expect(400))

test('should returns a 400 for no email and password', async () => request(app)
  .post('/api/users/signin')
  .send({})
  .expect(400))

test('should sets a cookie after successful signin', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201)

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(200)
  expect(response.get('Set-Cookie')).toBeDefined()
})
