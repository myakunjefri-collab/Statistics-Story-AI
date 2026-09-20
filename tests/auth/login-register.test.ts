import { describe, it, expect, beforeEach } from 'vitest'
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from '@/lib/auth/session'
import { MemoryFallbackDatabaseAdapter } from '@/lib/storage/memory-fallback-adapter'
import { UserRepository } from '@/lib/storage/repositories/user-repository'

describe('Auth & Session Security (TC01 & TC02)', () => {
  let db: MemoryFallbackDatabaseAdapter

  beforeEach(() => {
    db = new MemoryFallbackDatabaseAdapter()
  })

  it('TC01: Login dengan data valid (email & kata sandi benar)', async () => {
    // Setup user with hashed password
    const email = 'mahasiswa@uns.ac.id'
    const rawPassword = 'Password123!'
    const hashed = await hashPassword(rawPassword)

    const created = await db.createUser({
      nama: 'Budi Santoso',
      email,
      password_hash: hashed,
      peran: 'mahasiswa',
    })

    expect(created.id_pengguna).toBeDefined()

    // Retrieve user and verify credentials
    const foundUser = await db.findUserByEmail(email)
    expect(foundUser).not.toBeNull()

    const passwordMatches = await verifyPassword(rawPassword, foundUser!.password_hash)
    expect(passwordMatches).toBe(true)

    // Verify session token generation
    const token = await createSessionToken({
      userId: foundUser!.id_pengguna,
      email: foundUser!.email,
      peran: foundUser!.peran,
    })

    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(2)

    // Verify session token decoding & authenticity
    const session = await verifySessionToken(token)
    expect(session).not.toBeNull()
    expect(session?.userId).toBe(foundUser!.id_pengguna)
    expect(session?.email).toBe(email)
    expect(session?.peran).toBe('mahasiswa')
  })

  it('TC02: Login dengan data tidak valid (kata sandi salah)', async () => {
    const email = 'dosen@uns.ac.id'
    const correctPassword = 'DosenSecurePassword2026!'
    const wrongPassword = 'WrongPassword!'

    const hashed = await hashPassword(correctPassword)
    await db.createUser({
      nama: 'Dr. Hendra',
      email,
      password_hash: hashed,
      peran: 'dosen',
    })

    const foundUser = await db.findUserByEmail(email)
    expect(foundUser).not.toBeNull()

    // Test with wrong password
    const matches = await verifyPassword(wrongPassword, foundUser!.password_hash)
    expect(matches).toBe(false)
  })

  it('NFR01 Security: Password is never stored in plaintext', async () => {
    const rawPassword = 'SuperSecretPlaintext123!'
    const hashed = await hashPassword(rawPassword)

    expect(hashed).not.toBe(rawPassword)
    expect(hashed.startsWith('$2')).toBe(true) // bcrypt hash prefix
    expect(hashed).not.toContain(rawPassword)
  })

  it('Security: Tampered or invalid session token is rejected', async () => {
    const validToken = await createSessionToken({
      userId: 42,
      email: 'user@uns.ac.id',
      peran: 'mahasiswa',
    })

    const [payloadBase64, signature] = validToken.split('.')
    // Tamper with payload (change userId to 999)
    const tamperedPayload = Buffer.from(
      JSON.stringify({ userId: 999, email: 'hacker@uns.ac.id', peran: 'dosen', exp: Date.now() + 10000 }),
    ).toString('base64url')

    const tamperedToken = `${tamperedPayload}.${signature}`
    const verified = await verifySessionToken(tamperedToken)
    expect(verified).toBeNull()

    // Malformed token
    expect(await verifySessionToken('invalid-token')).toBeNull()
    expect(await verifySessionToken('')).toBeNull()
  })
})
