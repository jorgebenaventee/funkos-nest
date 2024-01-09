type MockedService<T> = {
  [P in keyof T]?: T[P] extends (...args: any[]) => any
    ? ReturnType<(typeof jest)['fn']>
    : never
}

export function createMockedService<T>(
  service: new (...args: any[]) => T,
): MockedService<T> {
  const mock: MockedService<T> = {}
  const prototype = service.prototype
  const properties = Object.getOwnPropertyNames(prototype).filter(
    (p) => p !== 'constructor',
  )
  for (const key of properties) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, key)
    if (typeof descriptor.value === 'function') {
      mock[key] = jest.fn()
    }
  }
  return mock
}
