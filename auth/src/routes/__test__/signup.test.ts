import request from 'supertest'
import app from '../../app'

test('should returns a 201 on successful signup', async () => request(app)
  .post('/api/users/signup')
  .send({
    email: 'test@test.com',
    password: 'password',
  })
  .expect(201))

test('should returns a 400 for invalid email', async () => request(app)
  .post('/api/users/signup')
  .send({
    email: 'testtestcom',
    password: 'password',
  })
  .expect(400))

test('should returns a 400 for invalid password', async () => request(app)
  .post('/api/users/signup')
  .send({
    email: 'test@test.com',
    password: '5',
  })
  .expect(400))

test('should returns a 400 for no email and password', async () => request(app)
  .post('/api/users/signup')
  .send({})
  .expect(400))

test('should disallows duplicate emails', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201)

  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(400)
})

test('should sets a cookie after successful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201)
  expect(response.get('Set-Cookie')).toBeDefined()
})
