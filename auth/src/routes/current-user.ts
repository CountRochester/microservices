import express, { Request, Response } from 'express'
import { currentUser } from '@cr-tickets/common'

const router = express.Router()

router.get('/api/users/currentuser', currentUser, (req: Request, res: Response): void => {
  res.status(200)
    .contentType('application/json')
    .send({ currentUser: req.currentUser || null })
})

export { router as currentUserRouter }
