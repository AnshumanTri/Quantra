import express from 'express'
import axios from 'axios'
import NodeCache from 'node-cache'
import { NseIndia } from 'stock-nse-india'
import authMiddleware from '../middleware/authMiddleware.js'
import {
  SANDBOX_BASE,
  getInstrumentKey,
  getSandboxToken,
} from '../utils/upstoxClient.js'

const router = express.Router()
const nse = new NseIndia()
const priceCache = new NodeCache({ stdTTL: 15 })
const ohlcCache  = new NodeCache({ stdTTL: 60 })

router.use(authMiddleware)

// ─── MOCK FALLBACK DATA ───────────────────────────────────
const mockStockData = {
  RELIANCE:    { symbol: 'RELIANCE',    company_name: 'Reliance Industries',      price: 2847.50, change: 34.20,   change_pct: 1.22  },
  TCS:         { symbol: 'TCS',         company_name: 'Tata Consultancy Services', price: 3921.10, change: -45.30,  change_pct: -1.14 },
  INFY:        { symbol: 'INFY',        company_name: 'Infosys',                   price: 1456.75, change: 12.40,   change_pct: 0.86  },
  HDFCBANK:    { symbol: 'HDFCBANK',    company_name: 'HDFC Bank',                 price: 1678.30, change: -8.90,   change_pct: -0.53 },
  WIPRO:       { symbol: 'WIPRO',       company_name: 'Wipro',                     price: 456.20,  change: 5.60,    change_pct: 1.24  },
  TATAMOTORS:  { symbol: 'TATAMOTORS',  company_name: 'Tata Motors',               price: 924.85,  change: 18.75,   change_pct: 2.07  },
  BAJFINANCE:  { symbol: 'BAJFINANCE',  company_name: 'Bajaj Finance',             price: 7123.40, change: -92.10,  change_pct: -1.28 },
  SBIN:        { symbol: 'SBIN',        company_name: 'State Bank of India',       price: 812.60,  change: 9.30,    change_pct: 1.16  },
  ICICIBANK:   { symbol: 'ICICIBANK',   company_name: 'ICICI Bank',                price: 1234.50, change: 15.80,   change_pct: 1.30  },
  ADANIENT:    { symbol: 'ADANIENT',    company_name: 'Adani Enterprises',         price: 2456.90, change: -31.40,  change_pct: -1.26 },
  LTIM:        { symbol: 'LTIM',        company_name: 'LTIMindtree',               price: 5234.60, change: 67.30,   change_pct: 1.30  },
  HCLTECH:     { symbol: 'HCLTECH',     company_name: 'HCL Technologies',          price: 1567.80, change: -23.40,  change_pct: -1.47 },
  ASIANPAINT:  { symbol: 'ASIANPAINT',  company_name: 'Asian Paints',              price: 2876.40, change: 45.60,   change_pct: 1.61  },
  MARUTI:      { symbol: 'MARUTI',      company_name: 'Maruti Suzuki',             price: 12456.00,change: -234.00, change_pct: -1.84 },
  SUNPHARMA:   { symbol: 'SUNPHARMA',   company_name: 'Sun Pharmaceutical',        price: 1234.50, change: 23.40,   change_pct: 1.93  },
}

const mockIndices = {
  NIFTY50: { symbol: 'NIFTY50', name: 'NIFTY 50',  price: 22450.50, change: -104.75, change_pct: -0.46 },
  SENSEX:  { symbol: 'SENSEX',  name: 'SENSEX',     price: 73847.20, change: -371.83, change_pct: -0.50 },
  NIFTYBANK: { symbol: 'NIFTYBANK', name: 'BANK NIFTY', price: 48234.60, change: 234.50, change_pct: 0.49 },
}

const fluctuate = (price) =>
  parseFloat((price + (Math.random() - 0.48) * price * 0.003).toFixed(2))

// ─── NSE quote fetch ──────────────────────────────────────
async function fetchNSEQuote(symbol) {
  try {
    const data = await nse.getEquityDetails(symbol)
    const q = data?.priceInfo
    if (!q?.lastPrice) throw new Error('no price')
    return {
      symbol,
      company_name: data?.info?.companyName || symbol,
      price:      q.lastPrice,
      change:     parseFloat(q.change?.toFixed(2)),
      change_pct: parseFloat(q.pChange?.toFixed(2)),
      high:       q.intraDayHighLow?.max,
      low:        q.intraDayHighLow?.min,
      open:       q.open,
      volume:     data?.securityInfo?.tradedVolume || 0,
      timestamp:  new Date().toISOString(),
      source:     'nse',
    }
  } catch {
    return null
  }
}

// ─── Upstox sandbox quote fetch ───────────────────────────
async function fetchUpstoxQuote(symbol) {
  try {
    const token = await getSandboxToken()
    if (!token) return null
    const key = getInstrumentKey(symbol)
    if (!key) return null
    const res = await axios.get(`${SANDBOX_BASE}/market-quote/quotes`, {
      params: { instrument_key: key },
      headers: { Authorization: `Bearer ${token}` },
    })
    const q = res.data?.data?.[key]
    if (!q) return null
    return {
      symbol,
      company_name: mockStockData[symbol]?.company_name || symbol,
      price:      q.last_price,
      change:     parseFloat((q.last_price - q.ohlc?.close).toFixed(2)),
      change_pct: parseFloat((((q.last_price - q.ohlc?.close) / q.ohlc?.close) * 100).toFixed(2)),
      high:       q.ohlc?.high,
      low:        q.ohlc?.low,
      open:       q.ohlc?.open,
      volume:     q.volume,
      timestamp:  new Date().toISOString(),
      source:     'upstox',
    }
  } catch {
    return null
  }
}

// ─── Smart quote: NSE → Upstox → mock ────────────────────
async function getSmartQuote(symbol) {
  const cached = priceCache.get(symbol)
  if (cached) return cached

  let quote = await fetchNSEQuote(symbol)
  if (!quote) quote = await fetchUpstoxQuote(symbol)
  if (!quote) {
    const mock = mockStockData[symbol]
    if (!mock) return null
    quote = { ...mock, price: fluctuate(mock.price), timestamp: new Date().toISOString(), source: 'mock' }
  }

  priceCache.set(symbol, quote)
  return quote
}

// ─── GET QUOTES ───────────────────────────────────────────
router.get('/quotes', async (req, res) => {
  const { symbols } = req.query
  if (!symbols) return res.status(400).json({ error: 'symbols required' })
  const list = symbols.split(',').map(s => s.trim().toUpperCase())
  const quotes = {}
  await Promise.all(list.map(async (s) => {
    quotes[s] = await getSmartQuote(s)
  }))
  res.json({ quotes })
})

// ─── GET INDICES ──────────────────────────────────────────
router.get('/indices', async (req, res) => {
  const cacheKey = 'indices'
  const cached = priceCache.get(cacheKey)
  if (cached) return res.json({ indices: cached })

  try {
    // Try NSE for indices
    const [niftyData, sensexData] = await Promise.allSettled([
      nse.getIndexDetails('NIFTY 50'),
      nse.getIndexDetails('SENSEX'),
    ])

    const indices = { ...mockIndices }

    if (niftyData.status === 'fulfilled' && niftyData.value?.last) {
      const d = niftyData.value
      indices.NIFTY50 = {
        symbol: 'NIFTY50', name: 'NIFTY 50',
        price:      d.last,
        change:     parseFloat(d.variation?.toFixed(2)),
        change_pct: parseFloat(d.percentChange?.toFixed(2)),
      }
    }
    if (sensexData.status === 'fulfilled' && sensexData.value?.last) {
      const d = sensexData.value
      indices.SENSEX = {
        symbol: 'SENSEX', name: 'SENSEX',
        price:      d.last,
        change:     parseFloat(d.variation?.toFixed(2)),
        change_pct: parseFloat(d.percentChange?.toFixed(2)),
      }
    }

    priceCache.set(cacheKey, indices, 30)
    res.json({ indices })
  } catch {
    res.json({ indices: mockIndices })
  }
})

router.get('/movers', async (req, res) => {
  const cached = priceCache.get('movers')
  if (cached) return res.json(cached)

  // Always build from mockStockData with fluctuation — NSE is bonus
  const buildFromMock = () => {
    const all = Object.values(mockStockData).map(s => ({
      ...s,
      price:      fluctuate(s.price),
      change_pct: parseFloat((s.change_pct + (Math.random() - 0.5) * 0.3).toFixed(2)),
    }))
    const gainers = [...all].sort((a, b) => b.change_pct - a.change_pct).slice(0, 5)
    const losers  = [...all].sort((a, b) => a.change_pct - b.change_pct).slice(0, 5)
    return { gainers, losers }
  }

  try {
    const data = await nse.getEquityStockIndices('NIFTY 50')
    const stocks = data?.data || []

    if (stocks.length === 0) throw new Error('empty')

    const sorted = stocks
      .filter(s => s.pChange !== undefined)
      .map(s => ({
        symbol:       s.symbol,
        company_name: s.meta?.companyName || s.symbol,
        price:        s.lastPrice,
        change:       s.change,
        change_pct:   s.pChange,
      }))

    const gainers = [...sorted].sort((a, b) => b.change_pct - a.change_pct).slice(0, 5)
    const losers  = [...sorted].sort((a, b) => a.change_pct - b.change_pct).slice(0, 5)
    const result  = { gainers, losers }

    priceCache.set('movers', result, 60)
    res.json(result)
  } catch {
    const result = buildFromMock()
    priceCache.set('movers', result, 30)
    res.json(result)
  }
})
// ─── GET OHLC CHART DATA ──────────────────────────────────
router.get('/ohlc/:symbol', async (req, res) => {
  const { symbol } = req.params
  const { interval = '1M' } = req.query
  const cacheKey = `ohlc_${symbol}_${interval}`

  const cached = ohlcCache.get(cacheKey)
  if (cached) return res.json({ candles: cached })

  // Try Upstox sandbox first for OHLC
  try {
    const token = await getSandboxToken()
    const key   = getInstrumentKey(symbol)

    if (token && key) {
      const intervalMap = {
        '1D': { interval: '30minute', unit: 'days',   value: 1  },
        '1W': { interval: '1hour',    unit: 'days',   value: 7  },
        '1M': { interval: '1day',     unit: 'months', value: 1  },
        '1Y': { interval: '1week',    unit: 'years',  value: 1  },
      }
      const { interval: upInterval } = intervalMap[interval] || intervalMap['1M']

      const toDate   = new Date().toISOString().split('T')[0]
      const fromDate = new Date(
        interval === '1D' ? Date.now() - 1 * 86400000 :
        interval === '1W' ? Date.now() - 7 * 86400000 :
        interval === '1M' ? Date.now() - 30 * 86400000 :
                            Date.now() - 365 * 86400000
      ).toISOString().split('T')[0]

      const res2 = await axios.get(
        `${SANDBOX_BASE}/historical-candle/${encodeURIComponent(key)}/${upInterval}/${toDate}/${fromDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const raw = res2.data?.data?.candles || []
      if (raw.length > 0) {
        const candles = raw.map(c => ({
          time:   Math.floor(new Date(c[0]).getTime() / 1000),
          open:   c[1], high: c[2], low: c[3], close: c[4], volume: c[5],
        })).sort((a, b) => a.time - b.time)

        ohlcCache.set(cacheKey, candles)
        return res.json({ candles })
      }
    }
  } catch (err) {
    console.warn('Upstox OHLC failed:', err.message)
  }

// Try NSE historical
  try {
    const end   = new Date()
    const start = new Date()
    if      (interval === '1W') start.setDate(end.getDate() - 7)
    else if (interval === '1M') start.setMonth(end.getMonth() - 1)
    else if (interval === '1Y') start.setFullYear(end.getFullYear() - 1)
    else                        start.setDate(end.getDate() - 1)

    const raw = await nse.getEquityHistoricalData(symbol, { start, end })

    // NSE returns either a flat array or an array of {data:[...]} objects
    // Flatten both formats into one list
    let rows = []
    if (Array.isArray(raw)) {
      raw.forEach(item => {
        if (Array.isArray(item.data)) {
          rows = rows.concat(item.data)   // new format: [{data:[...]}, ...]
        } else if (item.CH_OPENING_PRICE || item.chOpeningPrice) {
          rows.push(item)                 // old flat format
        }
      })
    }

    if (rows.length > 0) {
      const candles = rows
        .filter(d => {
          // support both field name formats
          const open = d.CH_OPENING_PRICE || d.chOpeningPrice
          return open && open > 0
        })
        .map(d => {
          // new format uses camelCase, old format uses UPPER_SNAKE_CASE
          const isNew = !!d.chOpeningPrice

          const open   = isNew ? d.chOpeningPrice      : d.CH_OPENING_PRICE
          const high   = isNew ? d.chTradeHighPrice     : d.CH_TRADE_HIGH_PRICE
          const low    = isNew ? d.chTradeLowPrice      : d.CH_TRADE_LOW_PRICE
          const close  = isNew ? d.chClosingPrice       : d.CH_CLOSING_PRICE
          const volume = isNew ? d.chTotTradedQty       : d.CH_TOT_TRADED_QTY
          const ts     = isNew ? d.mtimestamp           : d.CH_TIMESTAMP

          // mtimestamp is "05-Jun-2026" — parse it correctly
          const time = isNew
            ? Math.floor(new Date(ts.split('-').reverse().join('-')).getTime() / 1000)
            : Math.floor(new Date(ts).getTime() / 1000)

          return { time, open, high, low, close, volume }
        })
        .filter(c => c.time > 0 && c.open > 0)
        .sort((a, b) => a.time - b.time)

      if (candles.length > 0) {
        const cacheTTL = { '1D': 30, '1W': 120, '1M': 300, '1Y': 600 }
        ohlcCache.set(cacheKey, candles, cacheTTL[interval] || 60)
        console.log(`NSE OHLC success: ${symbol} ${interval} — ${candles.length} candles`)
        return res.json({ candles })
      }
    }
  } catch (err) {
    console.warn('NSE OHLC failed:', err.message)
  }

  // Final fallback — generated mock OHLC
  console.warn(`All OHLC sources failed for ${symbol}, using mock`)
  const mockBase = mockStockData[symbol]?.price || 1500
  const candles = generateMockOHLC(symbol, interval)
 // Cache longer for longer intervals — 1D refreshes often, 1Y barely changes
const cacheTTL = { '1D': 30, '1W': 120, '1M': 300, '1Y': 600 }
ohlcCache.set(cacheKey, candles, cacheTTL[interval] || 60)
  res.json({ candles })
})

// ─── SEARCH ───────────────────────────────────────────────
router.get('/search', async (req, res) => {
  const { q } = req.query
  if (!q) return res.json({ results: [] })
  const query = q.toUpperCase()
  try {
    const allSymbols = await nse.getAllStockSymbols()
    const matched = allSymbols
      .filter(s => s.includes(query))
      .slice(0, 6)
      .map(symbol => ({
        symbol,
        company_name: mockStockData[symbol]?.company_name || symbol,
      }))
    res.json({ results: matched })
  } catch {
    const results = Object.values(mockStockData)
      .filter(s => s.symbol.includes(query) || s.company_name.toUpperCase().includes(query))
      .slice(0, 6)
    res.json({ results })
  }
})

function generateMockOHLC(symbol, interval, basePrice) {
  const base = basePrice || mockStockData[symbol]?.price || 1500


  // Each interval defines how many candles and the time step between them
  const config = {
    '1D': { count: 78,  stepMs: 5  * 60 * 1000         }, // 5min candles, ~6.5hr trading day
    '1W': { count: 35,  stepMs: 60 * 60 * 1000         }, // 1hr candles, 5 days
    '1M': { count: 30,  stepMs: 24 * 60 * 60 * 1000    }, // daily candles, 30 days
    '1Y': { count: 52,  stepMs: 7  * 24 * 60 * 60 * 1000 }, // weekly candles, 1 year
  }

  const { count, stepMs } = config[interval] || config['1M']

  // Start price slightly below current to show realistic upward drift
  let price = parseFloat((base * (0.88 + Math.random() * 0.06)).toFixed(2))

  const candles = []
  const now = Math.floor(Date.now() / 1000)

  for (let i = count; i >= 0; i--) {
    // timestamp goes from past → present (i=count is oldest, i=0 is most recent)
    const time = now - i * Math.floor(stepMs / 1000)

    const volatility = interval === '1D' ? 0.008 : 0.015
    const drift      = interval === '1Y' ? 0.002 : 0.0005 // slight upward bias

    const open   = price
    const change = (Math.random() - (0.5 - drift)) * price * volatility
    const close  = parseFloat((price + change).toFixed(2))
    const high   = parseFloat((Math.max(open, close) * (1 + Math.random() * 0.006)).toFixed(2))
    const low    = parseFloat((Math.min(open, close) * (1 - Math.random() * 0.006)).toFixed(2))
    const volume = Math.floor(Math.random() * 800000 + 200000)

    candles.push({ time, open, high, low, close, volume })
    price = close
  }

  return candles
}
// ─── DEBUG ROUTE ──────────────────────────────────────────
router.get('/debug/:symbol', async (req, res) => {
  const { symbol } = req.params
  const { interval = '1M' } = req.query

  const result = {
    symbol,
    interval,
    upstox: { attempted: false, success: false, error: null },
    nse:    { attempted: false, success: false, error: null },
    mock:   { candles: 0 },
  }

  // Test Upstox
  try {
    result.upstox.attempted = true
    const token = await getSandboxToken()
    result.upstox.token = token ? 'obtained' : 'null'
    const key = getInstrumentKey(symbol)
    result.upstox.instrument_key = key

    if (token && key) {
      const toDate   = new Date().toISOString().split('T')[0]
      const fromDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
      const res2 = await axios.get(
        `${SANDBOX_BASE}/historical-candle/${encodeURIComponent(key)}/1day/${toDate}/${fromDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const raw = res2.data?.data?.candles || []
      result.upstox.success      = raw.length > 0
      result.upstox.candle_count = raw.length
      result.upstox.sample       = raw[0]
    }
  } catch (err) {
    result.upstox.error = err.message
  }

  // Test NSE
  try {
    result.nse.attempted = true
    const end   = new Date()
    const start = new Date()
    start.setMonth(end.getMonth() - 1)
    const data = await nse.getEquityHistoricalData(symbol, { start, end })
    result.nse.success      = data?.length > 0
    result.nse.candle_count = data?.length || 0
    result.nse.sample       = data?.[0]
  } catch (err) {
    result.nse.error = err.message
  }

  // Mock
  const mock = generateMockOHLC(symbol, interval)
  result.mock.candles = mock.length
  result.mock.sample  = mock[0]

  res.json(result)
})
router.get('/clear-cache', async (req, res) => {
  ohlcCache.flushAll()
  priceCache.flushAll()
  res.json({ message: 'Cache cleared' })
})

export default router