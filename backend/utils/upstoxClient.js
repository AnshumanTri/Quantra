import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

// Upstox sandbox base URL
const SANDBOX_BASE = 'https://sandbox-api.upstox.com/v2'

// Upstox uses instrument keys like NSE_EQ|INE002A01018 for RELIANCE
// This maps our simple symbols to Upstox instrument keys
const INSTRUMENT_MAP = {
  RELIANCE:    'NSE_EQ|INE002A01018',
  TCS:         'NSE_EQ|INE467B01029',
  INFY:        'NSE_EQ|INE009A01021',
  HDFCBANK:    'NSE_EQ|INE040A01034',
  WIPRO:       'NSE_EQ|INE075A01022',
  TATAMOTORS:  'NSE_EQ|INE155A01022',
  BAJFINANCE:  'NSE_EQ|INE296A01024',
  SBIN:        'NSE_EQ|INE062A01020',
  ICICIBANK:   'NSE_EQ|INE090A01021',
  ADANIENT:    'NSE_EQ|INE423A01024',
  NIFTY50:     'NSE_INDEX|Nifty 50',
  SENSEX:      'BSE_INDEX|SENSEX',
}

// Get sandbox access token
// Upstox sandbox uses a static token — no OAuth needed
let sandboxToken = null

export async function getSandboxToken() {
  if (sandboxToken) return sandboxToken
  try {
    const res = await axios.post(
      `${SANDBOX_BASE}/login/authorization/token`,
      new URLSearchParams({
        code:          'sandbox_auth_code',
        client_id:     process.env.UPSTOX_API_KEY,
        client_secret: process.env.UPSTOX_API_SECRET,
        redirect_uri:  process.env.UPSTOX_REDIRECT_URI,
        grant_type:    'authorization_code',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )
    sandboxToken = res.data.access_token
    return sandboxToken
  } catch {
    return null
  }
}

export function getInstrumentKey(symbol) {
  return INSTRUMENT_MAP[symbol.toUpperCase()] || null
}

export { SANDBOX_BASE, INSTRUMENT_MAP }