/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/naming-convention */
import {
  Schema, model, Document, Model,
} from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

interface TicketAttrs {
  title: string
  price: number
  userId: string
  orderId?: string
}

export type TicketDocument = Document<TicketAttrs> & TicketAttrs & { version: number }

interface TicketModel extends Model<TicketAttrs> {
  build(attrs: TicketAttrs): TicketDocument
}

const ticketSchema = new Schema<TicketAttrs, TicketModel, TicketDocument>({
  title: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  userId: {
    type: String,
    required: true,
  },

  orderId: {
    type: String,
  },
}, {
  toJSON: {
    transform: (doc: TicketDocument, ret: TicketDocument) => {
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

ticketSchema.set('versionKey', 'version')
ticketSchema.plugin(updateIfCurrentPlugin)

ticketSchema.static('build', function build(attrs: TicketAttrs) { return new this(attrs) })

const Ticket = model<TicketAttrs, TicketModel>('Ticket', ticketSchema)

export { Ticket }
