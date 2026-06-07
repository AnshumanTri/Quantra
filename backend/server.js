import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { NseIndia } from 'stock-nse-india'
import NodeCache from 'node-cache'

import authRoutes from './routes/auth.js'
import portfolioRoutes from './routes/portfolio.js'
import marketRoutes from './routes/market.js'
import orderRoutes from './routes/orders.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 5000

// ─── Socket.IO setup ─────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/portfolio', portfolioRoutes)
app.use('/api/market', marketRoutes)
app.use('/api/orders', orderRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// ─── Live price engine ────────────────────────────────────
const nse = new NseIndia()
const priceCache = new NodeCache({ stdTTL: 10 })

// Tracks which symbols all connected clients are watching
const subscribedSymbols = new Set()

// Mock base prices as fallback
const mockPrices = {
  RELIANCE:   2847.50, TCS:        3921.10, INFY:       1456.75,
  HDFCBANK:   1678.30, WIPRO:       456.20, TATAMOTORS:  924.85,
  BAJFINANCE: 7123.40, SBIN:        812.60, ICICIBANK:  1234.50,
  ADANIENT:   2456.90,
}

// Slightly fluctuate a price to simulate live movement
const fluctuate = (price) =>
  parseFloat((price + (Math.random() - 0.48) * price * 0.004).toFixed(2))

// Fetch real NSE price or fall back to mock
async function getLivePrice(symbol) {
  const cached = priceCache.get(symbol)
  if (cached) return cached

  try {
    const data = await nse.getEquityDetails(symbol)
    const price = data?.priceInfo?.lastPrice
    if (!price) throw new Error('No price')
    const result = { price, source: 'nse' }
    priceCache.set(symbol, result)
    return result
  } catch {
    const base = mockPrices[symbol] || 1000
    const price = fluctuate(base)
    mockPrices[symbol] = price  // update mock base so it drifts naturally
    return { price, source: 'mock' }
  }
}

// ─── Socket.IO connection handler ────────────────────────
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  // Client sends list of symbols it wants to watch
  socket.on('subscribe', (symbols) => {
    if (!Array.isArray(symbols)) return
    symbols.forEach(s => subscribedSymbols.add(s.toUpperCase()))
    console.log(`Subscribed to: ${[...subscribedSymbols].join(', ')}`)
  })

  // Client removes symbols from watch (e.g. removed from watchlist)
  socket.on('unsubscribe', (symbols) => {
    if (!Array.isArray(symbols)) return
    symbols.forEach(s => subscribedSymbols.delete(s.toUpperCase()))
  })

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
  })
})

// Track last known prices for drift simulation
const lastPrices = {}

setInterval(async () => {
  if (subscribedSymbols.size === 0) return

  const updates = {}
  await Promise.all(
    [...subscribedSymbols].map(async (symbol) => {
      try {
        const cached = priceCache.get(symbol)
        if (cached) {
          updates[symbol] = cached.price
          lastPrices[symbol] = cached.price
          return
        }
        // Drift from last known price if no cache
        const last = lastPrices[symbol] || mockPrices[symbol] || 1000
        const price = parseFloat((last + (Math.random() - 0.48) * last * 0.004).toFixed(2))
        lastPrices[symbol] = price
        updates[symbol] = price
      } catch {
        const last = lastPrices[symbol] || mockPrices[symbol] || 1000
        updates[symbol] = parseFloat((last * (1 + (Math.random() - 0.48) * 0.003)).toFixed(2))
      }
    })
  )

  io.emit('price_update', updates)
}, 3000)

// ─── Start server ─────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`TradeX backend running on http://localhost:${PORT}`)
})