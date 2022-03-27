import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'
import { BadRequestError, validateRequest } from '@cr-tickets/common'
import { User } from '../models/user'
import { SignBody } from './types'
import { Password } from '../services/password'

const router = express.Router()

const signUpValidators = [
  body('email')
    .isEmail()
    .withMessage('Invalid email or password'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Invalid email or password'),
]

router.post('/api/users/signin', signUpValidators, validateRequest, async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as SignBody

  const existingUser = await User.findOne({ email })
  if (!existingUser) {
    throw new BadRequestError('Invalid email or password')
  }

  const isValidPassword = await Password.compare(existingUser.password, password)

  if (!isValidPassword) {
    throw new BadRequestError('Invalid email or password')
  }

  const jwtPayload = { email: existingUser.email, id: existingUser.id as string }
  const userToken = jwt.sign(jwtPayload, process.env.JWT_KEY || 'secret')
  req.session = {
    jwt: userToken,
  }

  res.status(200)
    .contentType('application/json')
    .send(existingUser.toJSON())
})

export { router as signInRouter }
