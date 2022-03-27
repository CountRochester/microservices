/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/naming-convention */
import { Schema, model } from 'mongoose'
import { TicketAttrs, TicketDocument, TicketModel } from './ticket-types'
import { Order, OrderStatuses } from './orders'

const ticketSchema = new Schema<TicketAttrs, TicketModel, TicketDocument>({
  title: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },
}, {
  toJSON: {
    transform: (doc: TicketDocument, ret: TicketDocument) => {
      const {
        __v, _id, id, ...restProps
      } = ret

      return {
        id: _id,
        ...restProps,
      }
    },
  },
})

ticketSchema.set('versionKey', 'version')

ticketSchema.pre('save', function (done): void {
  this.$where = {
    version: this.get('version') ? this.get('version') - 1 : this.get('version'),
  }

  done()
})

ticketSchema.static('build', function build(attrs: TicketAttrs) {
  return new this({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  })
})

ticketSchema.static(
  'findByEvent',
  async (event: { id: string, version: number }): Promise<TicketDocument | null> => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const ticket = await Ticket.findOne({
      _id: event.id,
      version: event.version - 1,
    })
    return ticket as TicketDocument | null
  },
)

ticketSchema.methods.isReserved = async function (): Promise<boolean> {
  const availableStatuses: OrderStatuses[] = ['created', 'awaiting:payment', 'complete']
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: availableStatuses,
    },
  })
  return !!existingOrder
}

const Ticket = model<TicketAttrs, TicketModel>('Ticket', ticketSchema)

export { Ticket, TicketDocument }
