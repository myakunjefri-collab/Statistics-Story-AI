import fs from 'node:fs'
import path from 'node:path'
import pg from 'pg'

const { Pool } = pg

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.log('[MIGRATION] INFO: Variabel lingkungan DATABASE_URL tidak disetel.')
    console.log('[MIGRATION] Migrasi PostgreSQL dilewati untuk local development/mock environment.')
    return
  }

  console.log('[MIGRATION] Menghubungkan ke PostgreSQL database...')
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('sslmode=require') || databaseUrl.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
  })

  try {
    const client = await pool.connect()
    console.log('[MIGRATION] Terkoneksi ke database. Membaca file migrasi...')

    const migrationsDir = path.join(process.cwd(), 'database', 'migrations')
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()

    for (const file of files) {
      const filePath = path.join(migrationsDir, file)
      console.log(`[MIGRATION] Menjalankan ${file}...`)
      const sql = fs.readFileSync(filePath, 'utf-8')
      await client.query(sql)
      console.log(`[MIGRATION] Sukses: ${file}`)
    }

    client.release()
    console.log('[MIGRATION] Seluruh migrasi berhasil dieksekusi.')
  } catch (err) {
    console.error('[MIGRATION] Gagal menjalankan migrasi:', err)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runMigrations()
