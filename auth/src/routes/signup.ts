import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'
import { validateRequest, BadRequestError } from '@cr-tickets/common'
import { User } from '../models/user'
import { SignBody } from './types'

const router = express.Router()

const signUpValidators = [
  body('email')
    .isEmail()
    .withMessage('Invalid email'),
  body('password')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('The password should be more than 4 and less than 20 letters'),
]

router.post('/api/users/signup', signUpValidators, validateRequest, async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as SignBody

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new BadRequestError('User in use')
  }

  const user = User.build({ email, password })
  await user.save()

  const jwtPayload = { email: user.email, id: user.id as string }
  const userToken = jwt.sign(jwtPayload, process.env.JWT_KEY || 'secret')
  req.session = {
    jwt: userToken,
  }

  res.status(201)
    .contentType('application/json')
    .send(user.toJSON())
})

export { router as signUpRouter }
