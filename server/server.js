const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const pool = require('./db')

const app = express()

app.use(cors())
app.use(express.json())

// ===============================
// TEST
// ===============================

app.get('/api/test', (req, res) => {
  res.json({
    message: 'Internship Planter backend is working!'
  })
})


// ===============================
// USERS
// ===============================

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        id,
        username,
        email,
        microsoft_oid,
        created_at,
        updated_at
      FROM users`
    )

    res.json(rows)
  } catch (error) {
    console.error('Error getting users:', error)

    res.status(500).json({
      message: 'Could not retrieve users.'
    })
  }
})


app.post('/api/users', async (req, res) => {
  try {
    const {
      username,
      email,
      password
    } = req.body

    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required.'
      })
    }

    const normalizedUsername =
      username.trim().toLowerCase()

    if (normalizedUsername.length < 3) {
      return res.status(400).json({
        message: 'Username must be at least 3 characters.'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters.'
      })
    }

    const passwordHash =
      await bcrypt.hash(password, 12)

    const normalizedEmail =
      email?.trim().toLowerCase() || null

    const [result] =
      await pool.execute(
        `INSERT INTO users
          (
            username,
            email,
            password_hash
          )
         VALUES (?, ?, ?)`,
        [
          normalizedUsername,
          normalizedEmail,
          passwordHash
        ]
      )

    res.status(201).json({
      id: result.insertId,
      username: normalizedUsername,
      email: normalizedEmail
    })
  } catch (error) {
    console.error('Error creating user:', error)

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'That username or email is already in use.'
      })
    }

    res.status(500).json({
      message: 'Could not create user.'
    })
  }
})


// ===============================
// LOGIN
// ===============================

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required.'
      })
    }

    const normalizedUsername =
      username.trim().toLowerCase()

    const [rows] = await pool.execute(
      `SELECT
        id,
        username,
        email,
        password_hash
      FROM users
      WHERE username = ?
      LIMIT 1`,
      [normalizedUsername]
    )

    if (rows.length === 0) {
      return res.status(401).json({
        message: 'Incorrect username or password.'
      })
    }

    const user = rows[0]

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password_hash
      )

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Incorrect username or password.'
      })
    }

    res.json({
      message: 'Login successful!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Login error:', error)

    res.status(500).json({
      message: 'Login failed.'
    })
  }
})


// ===============================
// PROFILES
// ===============================

app.get('/api/profiles', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        users.username,
        profiles.profile_data
      FROM users
      LEFT JOIN profiles
        ON users.id = profiles.user_id
      ORDER BY users.created_at ASC
    `)

    const profiles = rows.map((row) => ({
      username: row.username,
      profile: row.profile_data || null
    }))

    res.json(profiles)
  } catch (error) {
    console.error('Error getting profiles:', error)

    res.status(500).json({
      message: 'Could not retrieve profiles.'
    })
  }
})


app.get('/api/profile/:username', async (req, res) => {
  try {
    const username =
      req.params.username.trim().toLowerCase()

    const [rows] = await pool.execute(
      `SELECT
        profiles.profile_data
      FROM users
      LEFT JOIN profiles
        ON users.id = profiles.user_id
      WHERE users.username = ?`,
      [username]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'User not found.'
      })
    }

    res.json(rows[0].profile_data || null)
  } catch (error) {
    console.error('Error getting profile:', error)

    res.status(500).json({
      message: 'Could not retrieve profile.'
    })
  }
})


app.put('/api/profile/:username', async (req, res) => {
  try {
    const username =
      req.params.username.trim().toLowerCase()

    const profileData = req.body

    const [users] = await pool.execute(
      `SELECT id
       FROM users
       WHERE username = ?`,
      [username]
    )

    if (users.length === 0) {
      return res.status(404).json({
        message: 'User not found.'
      })
    }

    const userId = users[0].id

    await pool.execute(
      `INSERT INTO profiles
        (user_id, profile_data)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE
        profile_data = VALUES(profile_data)`,
      [
        userId,
        JSON.stringify(profileData)
      ]
    )

    res.json({
      message: 'Profile saved.'
    })
  } catch (error) {
    console.error('Error saving profile:', error)

    res.status(500).json({
      message: 'Could not save profile.'
    })
  }
})


// ===============================
// JOURNALS
// ===============================

app.get('/api/journals/:username', async (req, res) => {
  try {
    const username =
      req.params.username.trim().toLowerCase()

    const [rows] = await pool.execute(
      `SELECT journals.journal_data
       FROM users
       LEFT JOIN journals
         ON users.id = journals.user_id
       WHERE users.username = ?`,
      [username]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'User not found.'
      })
    }

    res.json(rows[0].journal_data || [])
  } catch (error) {
    console.error('Error getting journals:', error)

    res.status(500).json({
      message: 'Could not retrieve journals.'
    })
  }
})


app.put('/api/journals/:username', async (req, res) => {
  try {
    const username =
      req.params.username.trim().toLowerCase()

    const journalData = req.body

    const [users] = await pool.execute(
      `SELECT id
       FROM users
       WHERE username = ?`,
      [username]
    )

    if (users.length === 0) {
      return res.status(404).json({
        message: 'User not found.'
      })
    }

    const userId = users[0].id

    await pool.execute(
      `INSERT INTO journals
        (user_id, journal_data)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE
        journal_data = VALUES(journal_data)`,
      [
        userId,
        JSON.stringify(journalData)
      ]
    )

    res.json({
      message: 'Journals saved.'
    })
  } catch (error) {
    console.error('Error saving journals:', error)

    res.status(500).json({
      message: 'Could not save journals.'
    })
  }
})


// ===============================
// STAR STATEMENTS
// ===============================

app.get('/api/stars/:username', async (req, res) => {
  try {
    const username =
      req.params.username.trim().toLowerCase()

    const [rows] = await pool.execute(
      `SELECT star_statements.star_data
       FROM users
       LEFT JOIN star_statements
         ON users.id = star_statements.user_id
       WHERE users.username = ?`,
      [username]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'User not found.'
      })
    }

    res.json(rows[0].star_data || [])
  } catch (error) {
    console.error(
      'Error getting STAR statements:',
      error
    )

    res.status(500).json({
      message: 'Could not retrieve STAR statements.'
    })
  }
})


app.put('/api/stars/:username', async (req, res) => {
  try {
    const username =
      req.params.username.trim().toLowerCase()

    const starData = req.body

    const [users] = await pool.execute(
      `SELECT id
       FROM users
       WHERE username = ?`,
      [username]
    )

    if (users.length === 0) {
      return res.status(404).json({
        message: 'User not found.'
      })
    }

    const userId = users[0].id

    await pool.execute(
      `INSERT INTO star_statements
        (user_id, star_data)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE
        star_data = VALUES(star_data)`,
      [
        userId,
        JSON.stringify(starData)
      ]
    )

    res.json({
      message: 'STAR statements saved.'
    })
  } catch (error) {
    console.error(
      'Error saving STAR statements:',
      error
    )

    res.status(500).json({
      message: 'Could not save STAR statements.'
    })
  }
})


// ===============================
// START SERVER
// ===============================

const PORT = 3001

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})