/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/naming-convention */
import {
  Schema, model, Document, Model,
} from 'mongoose'
import { OrderStatuses } from '@cr-tickets/common'

interface OrderAttrs {
  id: string
  version: number
  userId: string
  price: number
  status: OrderStatuses
}

export type OrderDocument = Document<OrderAttrs> & OrderAttrs & { version: number }

interface OrderModel extends Model<OrderAttrs> {
  build(attrs: OrderAttrs): OrderDocument
}

const orderSchema = new Schema<OrderAttrs, OrderModel, OrderDocument>(
  {
    userId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
    transform: (doc: OrderDocument, ret: OrderDocument) => {
      const {
        __v, _id, id, ...restProps
      } = ret

      return {
        id: _id,
        ...restProps,
      }
    },
  },
  }
)

orderSchema.set('versionKey', 'version')
orderSchema.pre('save', function (done): void {
  this.$where = {
    version: this.get('version') ? this.get('version') - 1 : this.get('version'),
  }

  done()
})
orderSchema.static('build', function build(attrs: OrderAttrs) { return new this({
    _id: attrs.id,
    version: attrs.version,
    price: attrs.price,
    userId: attrs.userId,
    status: attrs.status,
  }) })

const Order = model<OrderAttrs, OrderModel>('Order', orderSchema)

export { Order, OrderStatuses, OrderAttrs }
