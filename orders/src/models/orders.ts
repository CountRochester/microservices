/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/naming-convention */
import {
  Schema, model, Document, Model,
} from 'mongoose'
import { OrderStatuses, orderStatuses } from '@cr-tickets/common'
import { TicketDocument } from './ticket-types'

interface OrderAttrs {
  userId: string
  status: OrderStatuses
  expiresAt: Date
  ticket: TicketDocument
}

export type OrderDocument = Document<OrderAttrs> & OrderAttrs & { version: number }

interface OrderModel extends Model<OrderAttrs> {
  build(attrs: OrderAttrs): OrderDocument
}

const orderSchema = new Schema<OrderAttrs, OrderModel, OrderDocument>({
  userId: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    required: true,
    enum: orderStatuses,
    default: 'created',
  },

  expiresAt: {
    type: Schema.Types.Date,
  },

  ticket: {
    type: Schema.Types.ObjectId,
    ref: 'Ticket',
  },
}, {
  toJSON: {
    transform: (doc: OrderDocument, ret: OrderDocument) => {
      const {
        __v, _id, ...restProps
      } = ret

      return {
        id: _id,
        ...restProps,
      }
    },
  },
})

orderSchema.set('versionKey', 'version')

orderSchema.pre('save', function (done): void {
  this.$where = {
    version: this.get('version') ? this.get('version') - 1 : this.get('version'),
  }

  done()
})

orderSchema.static('build', function build(attrs: OrderAttrs) { return new this(attrs) })

const Order = model<OrderAttrs, OrderModel>('Order', orderSchema)

export { Order, OrderStatuses, OrderAttrs }
