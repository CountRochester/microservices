export const natsWrapper = {
  connect: jest.fn(),
  client: {
    close: jest.fn(),
    subscribe: jest.fn(),
    publish: jest.fn((subject: string, data: string, callback: () => void) => {
      callback()
    }),
  },
}
