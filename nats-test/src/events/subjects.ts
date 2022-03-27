export const subjectsNames = [
  'ticket:created',
  'order:updated',
] as const

export type Subjects = ReturnType<() => typeof subjectsNames[keyof typeof subjectsNames]>
