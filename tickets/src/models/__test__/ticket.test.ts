import { Ticket } from '../ticket'

test('Should implements optimistic concurrency control', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 200,
    userId: '123',
  })
  await ticket.save()

  const firstInstance = await Ticket.findById(ticket.id)
  const secondInstance = await Ticket.findById(ticket.id)

  firstInstance!.set({ price: 100 })
  secondInstance!.set({ price: 150 })

  await firstInstance!.save()

  await expect(secondInstance!.save()).rejects.toThrow()
})

test('Should increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 200,
    userId: '123',
  })
  await ticket.save()
  expect(ticket.version).toBe(0)

  ticket.set({ price: 100 })
  await ticket.save()
  expect(ticket.version).toBe(1)

  ticket.set({ price: 150 })
  await ticket.save()
  expect(ticket.version).toBe(2)
})
