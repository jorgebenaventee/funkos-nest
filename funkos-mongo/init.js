db = db.getSiblingDB('orders')

db.createUser({
  user: 'funko',
  pwd: 'funko',
  roles: [
    {
      role: 'readWrite',
      db: 'orders',
    },
  ],
})
