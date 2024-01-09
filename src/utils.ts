type MockedService<T> = {
  [P in keyof T]: T[P] extends (...args: any[]) => any
    ? ReturnType<(typeof jest)['fn']>
    : never
}

export function createMockedService<T>(
  service: new (...args: any[]) => T,
): MockedService<T> {
  const prototype = service.prototype
  const properties = Object.getOwnPropertyNames(prototype).filter(
    (p) => p !== 'constructor',
  )
  return properties
    .filter((p) => {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, p)
      return typeof descriptor.value === 'function'
    })
    .reduce((acc, curr) => {
      acc[curr] = jest.fn()
      return acc
    }, {} as MockedService<T>)
}
