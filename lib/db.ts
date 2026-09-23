import sql from 'mssql'

const config: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME,
  options: {
    encrypt: true, 
    trustServerCertificate: true, // Set to true for local dev
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
}

// Global caching to prevent exhausting connections in Next.js development mode
let poolPromise: Promise<sql.ConnectionPool> | null = null;

export function getSqlConnectionPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config).connect();
  }
  return poolPromise;
}
