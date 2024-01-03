export function createMockedService(service: any) {
  const mock = {}
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
