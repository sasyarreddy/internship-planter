// Cloudflare Worker for Internship Planter.
// Serves the built React app and handles every /api/* route using Cloudflare D1.
// Replaces the old Express + MySQL backend in /server.

// ===============================
// HELPERS
// ===============================

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function parseJson(text, fallback) {
  if (text == null) return fallback
  try {
    return JSON.parse(text)
  } catch {
    return fallback
  }
}

async function readBody(request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

function normalizeUsername(value) {
  return decodeURIComponent(value).trim().toLowerCase()
}

// ===============================
// PASSWORD HASHING (PBKDF2 via Web Crypto)
// bcrypt is too slow for the Workers free plan's CPU limit,
// so passwords are hashed with the built-in PBKDF2 instead.
// ===============================

const PBKDF2_ITERATIONS = 100000

function toBase64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
}

function fromBase64(text) {
  return Uint8Array.from(atob(text), (c) => c.charCodeAt(0))
}

async function deriveKey(password, salt, iterations) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    keyMaterial,
    256
  )
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await deriveKey(password, salt, PBKDF2_ITERATIONS)
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`
}

async function verifyPassword(password, stored) {
  const [scheme, iterations, saltB64, hashB64] = String(stored).split('$')
  if (scheme !== 'pbkdf2') return false

  const expected = fromBase64(hashB64)
  const actual = new Uint8Array(
    await deriveKey(password, fromBase64(saltB64), Number(iterations))
  )
  if (actual.length !== expected.length) return false

  let diff = 0
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i]
  return diff === 0
}

// ===============================
// ROUTE HANDLERS
// ===============================

async function createUser(request, db) {
  const body = await readBody(request)
  const { username, email, password } = body || {}

  if (!username || !password) {
    return json({ message: 'Username and password are required.' }, 400)
  }

  const normalizedUsername = String(username).trim().toLowerCase()

  if (normalizedUsername.length < 3) {
    return json({ message: 'Username must be at least 3 characters.' }, 400)
  }

  if (String(password).length < 6) {
    return json({ message: 'Password must be at least 6 characters.' }, 400)
  }

  const normalizedEmail = email ? String(email).trim().toLowerCase() || null : null
  const passwordHash = await hashPassword(String(password))

  try {
    const result = await db
      .prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)')
      .bind(normalizedUsername, normalizedEmail, passwordHash)
      .run()

    return json(
      {
        id: result.meta.last_row_id,
        username: normalizedUsername,
        email: normalizedEmail,
      },
      201
    )
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) {
      return json({ message: 'That username or email is already in use.' }, 409)
    }
    throw error
  }
}

async function login(request, db) {
  const body = await readBody(request)
  const { username, password } = body || {}

  if (!username || !password) {
    return json({ message: 'Username and password are required.' }, 400)
  }

  const user = await db
    .prepare('SELECT id, username, email, password_hash FROM users WHERE username = ? LIMIT 1')
    .bind(String(username).trim().toLowerCase())
    .first()

  if (!user || !(await verifyPassword(String(password), user.password_hash))) {
    return json({ message: 'Incorrect username or password.' }, 401)
  }

  return json({
    message: 'Login successful!',
    user: { id: user.id, username: user.username, email: user.email },
  })
}

async function listProfiles(db) {
  const { results } = await db
    .prepare(
      `SELECT users.username, profiles.profile_data
       FROM users
       LEFT JOIN profiles ON users.id = profiles.user_id
       ORDER BY users.created_at ASC`
    )
    .all()

  return json(
    results.map((row) => ({
      username: row.username,
      profile: parseJson(row.profile_data, null),
    }))
  )
}

// Profiles, journals and STAR statements share the same shape:
// one JSON blob per user, read with GET and replaced with PUT.
const USER_DATA = {
  profile: { table: 'profiles', column: 'profile_data', empty: null, label: 'Profile' },
  journals: { table: 'journals', column: 'journal_data', empty: [], label: 'Journals' },
  stars: { table: 'star_statements', column: 'star_data', empty: [], label: 'STAR statements' },
}

async function getUserData(kind, username, db) {
  const { table, column, empty } = USER_DATA[kind]

  const row = await db
    .prepare(
      `SELECT ${table}.${column} AS data
       FROM users
       LEFT JOIN ${table} ON users.id = ${table}.user_id
       WHERE users.username = ?`
    )
    .bind(username)
    .first()

  if (!row) return json({ message: 'User not found.' }, 404)
  return json(parseJson(row.data, empty))
}

async function saveUserData(kind, username, request, db) {
  const { table, column, label } = USER_DATA[kind]

  const user = await db.prepare('SELECT id FROM users WHERE username = ?').bind(username).first()
  if (!user) return json({ message: 'User not found.' }, 404)

  const body = await readBody(request)

  await db
    .prepare(
      `INSERT INTO ${table} (user_id, ${column}, updated_at)
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(user_id) DO UPDATE SET
         ${column} = excluded.${column},
         updated_at = excluded.updated_at`
    )
    .bind(user.id, JSON.stringify(body))
    .run()

  return json({ message: `${label} saved.` })
}

// ===============================
// ROUTER
// ===============================

async function handleApi(request, env, pathname) {
  const db = env.DB
  const method = request.method

  if (pathname === '/api/test' && method === 'GET') {
    return json({ message: 'Internship Planter backend is working!' })
  }

  if (pathname === '/api/users' && method === 'POST') return createUser(request, db)
  if (pathname === '/api/login' && method === 'POST') return login(request, db)
  if (pathname === '/api/profiles' && method === 'GET') return listProfiles(db)

  const match = pathname.match(/^\/api\/(profile|journals|stars)\/([^/]+)$/)
  if (match) {
    const [, kind, rawUsername] = match
    const username = normalizeUsername(rawUsername)
    if (method === 'GET') return getUserData(kind, username, db)
    if (method === 'PUT') return saveUserData(kind, username, request, db)
  }

  return json({ message: 'Not found.' }, 404)
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(request, env, url.pathname)
      } catch (error) {
        console.error('API error:', error)
        return json({ message: 'Something went wrong.' }, 500)
      }
    }

    return env.ASSETS.fetch(request)
  },
}
