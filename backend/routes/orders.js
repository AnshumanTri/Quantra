import express from 'express'
import supabase from '../db/supabase.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()
router.use(authMiddleware)

// ─── PLACE ORDER (BUY or SELL) ────────────────────────────
router.post('/place', async (req, res) => {
  const { symbol, company_name, order_type, quantity, price } = req.body
  const user_id = req.user.id

  // Validation
  if (!symbol || !order_type || !quantity || !price)
    return res.status(400).json({ error: 'All fields required' })

  if (!['BUY', 'SELL'].includes(order_type))
    return res.status(400).json({ error: 'Invalid order type' })

  if (quantity <= 0 || price <= 0)
    return res.status(400).json({ error: 'Quantity and price must be positive' })

  const totalCost = parseFloat((quantity * price).toFixed(2))

  try {
    // ── Fetch current user balance ──
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', user_id)
      .single()

    if (userError) throw userError

    // ── Fetch existing holding for this symbol ──
    const { data: holding } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', user_id)
      .eq('symbol', symbol)
      .single()

    // ─────────────────────────────────────────────
    // BUY LOGIC
    // ─────────────────────────────────────────────
    if (order_type === 'BUY') {
      if (user.balance < totalCost)
        return res.status(400).json({ error: 'Insufficient balance' })

      // Deduct balance
      const newBalance = parseFloat((user.balance - totalCost).toFixed(2))
      await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user_id)

      if (holding) {
        // Update existing holding — recalculate avg price
        const newQty = holding.quantity + parseInt(quantity)
        const newAvgPrice = parseFloat(
          ((holding.avg_price * holding.quantity + price * quantity) / newQty).toFixed(2)
        )
        await supabase
          .from('holdings')
          .update({ quantity: newQty, avg_price: newAvgPrice })
          .eq('id', holding.id)
      } else {
        // Create new holding
        await supabase
          .from('holdings')
          .insert([{ user_id, symbol, company_name, quantity: parseInt(quantity), avg_price: price }])
      }
    }

    // ─────────────────────────────────────────────
    // SELL LOGIC
    // ─────────────────────────────────────────────
    if (order_type === 'SELL') {
      if (!holding || holding.quantity < quantity)
        return res.status(400).json({ error: 'Insufficient shares to sell' })

      // Add sale proceeds to balance
      const newBalance = parseFloat((user.balance + totalCost).toFixed(2))
      await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user_id)

      const newQty = holding.quantity - parseInt(quantity)

      if (newQty === 0) {
        // Remove holding entirely
        await supabase
          .from('holdings')
          .delete()
          .eq('id', holding.id)
      } else {
        // Reduce quantity (avg price stays the same on sell)
        await supabase
          .from('holdings')
          .update({ quantity: newQty })
          .eq('id', holding.id)
      }
    }

    // ── Record the order ──
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id,
        symbol,
        company_name,
        order_type,
        quantity: parseInt(quantity),
        price,
        status: 'EXECUTED',
      }])
      .select()
      .single()

    if (orderError) throw orderError

    res.status(201).json({ message: 'Order placed successfully', order })
  } catch (err) {
    console.error('Order error:', err)
    res.status(500).json({ error: 'Failed to place order' })
  }
})

export default router