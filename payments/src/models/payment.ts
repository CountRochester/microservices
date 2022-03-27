import {
  Schema, model, Document, Model,
} from 'mongoose'

interface PaymentAttrs {
  orderId: string
  stripeId: string
}

export type PaymentDocument = Document<PaymentAttrs> & PaymentAttrs

interface PaymentModel extends Model<PaymentAttrs> {
  build(attrs: PaymentAttrs): PaymentDocument
}

const paymentSchema = new Schema<PaymentAttrs, PaymentModel, PaymentDocument>(
  {
    orderId: {
      required: true,
      type: String,
    },
    stripeId: {
      required: true,
      type: String,
    },
  },
  {
    toJSON: {
    transform: (doc: PaymentDocument, ret: PaymentDocument) => {
      const {
        __v, _id, ...restProps
      } = ret

      return {
        id: _id,
        ...restProps,
      }
    },
  },
  }
)

paymentSchema.static('build', function build(attrs: PaymentAttrs) { return new this(attrs) })

const Payment = model<PaymentAttrs, PaymentModel>(
  'Payment',
  paymentSchema
)

export { Payment, PaymentAttrs }
