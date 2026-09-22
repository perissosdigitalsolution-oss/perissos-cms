import { Pool } from 'pg'

let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: parseInt(process.env.PG_POOL_SIZE || '10', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
    pool.on('error', (err) => {
      console.error('[DB Pool] Unexpected idle error', err)
    })
    pool.on('connect', () => {
      console.debug('[DB Pool] Connected')
    })
  }
  return pool
}

export async function queryDatabase<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const pool = getPool()
  const result = await pool.query(sql, params)
  return result.rows
}

process.on('SIGTERM', () => {
  if (pool) {
    pool.end()
    pool = null
    console.debug('[DB Pool] Shut down gracefully')
  }
})

process.on('SIGINT', () => {
  if (pool) {
    pool.end()
    pool = null
    console.debug('[DB Pool] Shut down gracefully')
  }
})
