import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import supabase from '../db/supabase.js'

const router = express.Router()

// ─── REGISTER ───────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body

  // Basic validation
  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields required' })

  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' })

  try {
    // Check if email already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existing)
      return res.status(400).json({ error: 'Email already registered' })

    // Hash password
    const password_hash = await bcrypt.hash(password, 10)

    // Insert user
    const { data: user, error } = await supabase
      .from('users')
      .insert([{ name, email, password_hash }])
      .select('id, name, email, balance')
      .single()

    if (error) throw error

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({ token, user })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ─── LOGIN ───────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(400).json({ error: 'All fields required' })

  try {
    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, password_hash, balance')
      .eq('email', email)
      .single()

    if (error || !user)
      return res.status(400).json({ error: 'Invalid email or password' })

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch)
      return res.status(400).json({ error: 'Invalid email or password' })

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Don't send password hash to frontend
    const { password_hash, ...userSafe } = user

    res.json({ token, user: userSafe })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ─── GET CURRENT USER (protected) ────────────────────────
router.get('/me', async (req, res) => {
  // This route will be protected by authMiddleware in server.js
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, balance')
      .eq('id', req.user.id)
      .single()

    if (error || !user)
      return res.status(404).json({ error: 'User not found' })

    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router