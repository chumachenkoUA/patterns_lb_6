const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: [{ emit: 'event', level: 'query' }],
});

prisma.$on('query', (event) => {
  const params =
    event.params && event.params !== '[]' ? ` -- params: ${event.params}` : '';
  console.log('[SQL]', event.query.trim(), params);
});

module.exports = prisma;
