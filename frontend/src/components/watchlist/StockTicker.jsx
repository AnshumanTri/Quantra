import { useEffect, useState } from 'react'

export default function StockTicker({ symbol, price, prevPrice }) {
  const [flash, setFlash] = useState(null) // 'up' | 'down' | null

  useEffect(() => {
    if (!prevPrice || price === prevPrice) return

    const direction = price > prevPrice ? 'up' : 'down'
    setFlash(direction)

    // Flash lasts 600ms then fades
    const timer = setTimeout(() => setFlash(null), 600)
    return () => clearTimeout(timer)
  }, [price])

  const flashClass =
    flash === 'up'
      ? 'bg-green-500/20 text-brand-green'
      : flash === 'down'
      ? 'bg-red-500/20 text-brand-red'
      : 'text-gray-900 dark:text-gray-100'

  return (
    <span className={`font-medium px-1.5 py-0.5 rounded transition-all duration-300 ${flashClass}`}>
      ₹{price?.toFixed(2) ?? '—'}
    </span>
  )
}