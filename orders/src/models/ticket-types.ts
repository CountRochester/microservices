import { Document, Model } from 'mongoose'

export interface TicketAttrs {
  id: string
  title: string
  price: number
}

export interface TicketAdditionMethods {
  isReserved (): Promise<boolean>
}

// eslint-disable-next-line max-len
export type TicketDocument = Document<TicketAttrs> & TicketAttrs & TicketAdditionMethods & { version: number }

export interface TicketModel extends Model<TicketAttrs> {
  build(attrs: TicketAttrs): TicketDocument
  findByEvent(event: { id: string, version: number }): Promise<TicketDocument | null>
}
