import { subjectsNames } from './subjects'

export interface TicketCreatedEvent {
  subject: typeof subjectsNames[0]
  data: {
    id: string
    title: string
    price: number
  }
}
