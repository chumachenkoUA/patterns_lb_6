const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const { format: formatSql } = require('sql-formatter');

const {
  DATABASE_URL,
  DB_HOST = '127.0.0.1',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'solid_users_db',
} = process.env;

const connectionConfig =
  DATABASE_URL ||
  {
    host: DB_HOST,
    port: Number(DB_PORT) || 3306,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  };

const adapter = new PrismaMariaDb(connectionConfig);

const prisma = new PrismaClient({
  adapter,
  log: [{ emit: 'event', level: 'query' }],
});

prisma.$on('query', (event) => {
  let formattedQuery = event.query.trim();
  try {
    formattedQuery = formatSql(event.query, { language: 'mysql' });
    formattedQuery = mergeLimitOffset(formattedQuery);
  } catch (err) {
    // ignore formatting errors, fall back to raw SQL
  }
  const paramString =
    event.params && event.params !== '[]' ? `-- params: ${event.params}` : '';
  const message = paramString
    ? `${formattedQuery}\n${paramString}`
    : formattedQuery;
  console.log('[SQL]\n' + message);
});

const mergeLimitOffset = (query) => {
  return query.replace(/LIMIT\s*\?\s*\nOFFSET\s*\?/gi, 'LIMIT ? OFFSET ?');
};

module.exports = prisma;
