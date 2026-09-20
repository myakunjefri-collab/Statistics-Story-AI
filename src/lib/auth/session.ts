import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import type { NextRequest } from 'next/server'

export interface SessionPayload {
  userId: number
  email: string
  peran: 'mahasiswa' | 'dosen'
  iat: number
  exp: number
}

const SESSION_COOKIE_NAME = 'auth_session'
const DEFAULT_SECRET = 'statistics-story-secret-key-development-minimum-32-chars!'

function getSecret(): string {
  const secret = process.env.SESSION_SECRET || DEFAULT_SECRET
  if (process.env.NODE_ENV === 'production' && secret === DEFAULT_SECRET) {
    throw new Error('FATAL: SESSION_SECRET must be explicitly set in production environment.')
  }
  return secret
}

/**
 * Creates a cryptographically signed stateless session token using HMAC-SHA256.
 */
export function createSessionToken(user: {
  id_pengguna?: number
  userId?: number
  email: string
  peran?: 'mahasiswa' | 'dosen'
}): string {
  const uid = user.id_pengguna ?? user.userId ?? 0
  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = {
    userId: uid,
    email: user.email,
    peran: user.peran || 'mahasiswa',
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7 days expiration
  }

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const hmac = crypto.createHmac('sha256', getSecret())
  hmac.update(payloadBase64)
  const signature = hmac.digest('base64url')

  return `${payloadBase64}.${signature}`
}

/**
 * Verifies the cryptographically signed session token and returns the payload.
 */
export function verifySessionToken(token?: string): SessionPayload | null {
  if (!token?.includes('.')) return null

  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [payloadBase64, providedSignature] = parts
  if (!payloadBase64 || !providedSignature) return null

  const hmac = crypto.createHmac('sha256', getSecret())
  hmac.update(payloadBase64)
  const expectedSignature = hmac.digest('base64url')

  // Timing safe equality check to prevent timing attacks
  const providedBuf = Buffer.from(providedSignature)
  const expectedBuf = Buffer.from(expectedSignature)

  if (providedBuf.length !== expectedBuf.length) return null
  if (!crypto.timingSafeEqual(providedBuf, expectedBuf)) return null

  try {
    const jsonStr = Buffer.from(payloadBase64, 'base64url').toString('utf-8')
    const payload = JSON.parse(jsonStr) as SessionPayload

    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

/**
 * Extracts and verifies session directly from incoming NextRequest cookies.
 */
export function getSessionFromRequest(request: NextRequest): SessionPayload | null {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)
  if (!cookie?.value) return null
  return verifySessionToken(cookie.value)
}

/**
 * Hashes a plaintext password using bcrypt with salt work factor 10.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Verifies a plaintext password against a stored bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export { SESSION_COOKIE_NAME }
