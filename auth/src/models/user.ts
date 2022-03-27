/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/naming-convention */
import {
  Schema, model, Document, Model, Callback,
} from 'mongoose'

import { Password } from '../services/password'

interface UserAttrs {
  email: string
  password: string
}

type UserDocument = Document<UserAttrs> & UserAttrs

interface UserModel extends Model<UserAttrs> {
  build(attrs: UserAttrs): UserDocument
}

const userSchema = new Schema<UserAttrs, UserModel, UserDocument>({
  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },
}, {
  toJSON: {
    transform: (doc: UserDocument, ret: UserDocument) => {
      const {
        password, __v, _id, ...restProps
      } = ret

      return {
        id: _id,
        ...restProps,
      }
    },
  },
})

userSchema.pre('save', async function preSave(done: Callback<void>) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password') as string)
    this.set('password', hashed)
  }

  done(null)
})

userSchema.static('build', function build(attrs: UserAttrs) { return new this(attrs) })

const User = model<UserAttrs, UserModel>('User', userSchema)

export { User }
