import express from 'express'
import supabase from '../db/supabase.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// All routes here are protected
router.use(authMiddleware)

// ─── GET USER PROFILE + BALANCE ──────────────────────────
router.get('/profile', async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, balance')
      .eq('id', req.user.id)
      .single()

    if (error) throw error
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// ─── GET HOLDINGS ─────────────────────────────────────────
router.get('/holdings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', req.user.id)

    if (error) throw error
    res.json({ holdings: data })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch holdings' })
  }
})

// ─── GET ORDERS ───────────────────────────────────────────
router.get('/orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json({ orders: data })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// ─── GET WATCHLIST ────────────────────────────────────────
router.get('/watchlist', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', req.user.id)
      .order('added_at', { ascending: true })

    if (error) throw error
    res.json({ watchlist: data })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch watchlist' })
  }
})

// ─── ADD TO WATCHLIST ─────────────────────────────────────
router.post('/watchlist', async (req, res) => {
  const { symbol, company_name } = req.body

  if (!symbol)
    return res.status(400).json({ error: 'Symbol required' })

  try {
    const { data, error } = await supabase
      .from('watchlist')
      .insert([{ user_id: req.user.id, symbol: symbol.toUpperCase(), company_name }])
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ item: data })
  } catch (err) {
    if (err.code === '23505')
      return res.status(400).json({ error: 'Already in watchlist' })
    res.status(500).json({ error: 'Failed to add to watchlist' })
  }
})

// ─── REMOVE FROM WATCHLIST ────────────────────────────────
router.delete('/watchlist/:symbol', async (req, res) => {
  try {
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', req.user.id)
      .eq('symbol', req.params.symbol.toUpperCase())

    if (error) throw error
    res.json({ message: 'Removed from watchlist' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from watchlist' })
  }
})

export default router