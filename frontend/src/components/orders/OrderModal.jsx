import { useState, useEffect } from 'react'
import { usePlaceOrder } from '../../hooks/usePortfolio'
import { useProfile } from '../../hooks/usePortfolio'

export default function OrderModal({ stock, onClose }) {
  const [orderType, setOrderType] = useState('BUY')
  const [quantity, setQuantity] = useState(1)
  const { data: profile } = useProfile()
  const placeOrder = usePlaceOrder()

  const price = stock?.price || 0
  const totalCost = parseFloat((quantity * price).toFixed(2))

  const canAfford = profile?.balance >= totalCost
  const hasShares = stock?.userQuantity >= quantity

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val)

  const handleSubmit = async () => {
    if (!stock) return
    try {
      await placeOrder.mutateAsync({
        symbol: stock.symbol,
        company_name: stock.company_name,
        order_type: orderType,
        quantity: parseInt(quantity),
        price,
      })
      onClose()
    } catch (err) {
      alert(err.response?.data?.error || 'Order failed')
    }
  }

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!stock) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Modal — slides in from right */}
      <div className="fixed right-0 top-0 h-full w-80 bg-light-surface dark:bg-dark-surface border-l border-light-border dark:border-dark-border z-50 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-light-border dark:border-dark-border">
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{stock.symbol}</p>
            <p className="text-xs text-dark-muted">{stock.company_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-dark-muted hover:text-gray-900 dark:hover:text-gray-100 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Buy / Sell toggle */}
        <div className="flex mx-5 mt-4 rounded-md overflow-hidden border border-light-border dark:border-dark-border">
          <button
            onClick={() => setOrderType('BUY')}
            className={`flex-1 py-2 text-sm font-medium transition-colors
              ${orderType === 'BUY'
                ? 'bg-brand-green text-white'
                : 'text-gray-500 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-border'
              }`}
          >
            BUY
          </button>
          <button
            onClick={() => setOrderType('SELL')}
            className={`flex-1 py-2 text-sm font-medium transition-colors
              ${orderType === 'SELL'
                ? 'bg-brand-red text-white'
                : 'text-gray-500 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-border'
              }`}
          >
            SELL
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-5 py-4 space-y-4">

          {/* Current price */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-dark-muted">Market price</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(price)}
            </span>
          </div>

          {/* Quantity input */}
          <div>
            <label className="block text-sm text-dark-muted mb-1">Quantity</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded border border-light-border dark:border-dark-border flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 text-center px-3 py-2 rounded border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-brand-blue"
              />
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-8 h-8 rounded border border-light-border dark:border-dark-border flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border"
              >
                +
              </button>
            </div>
          </div>

          {/* Total value */}
          <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-dark-muted">Total value</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(totalCost)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-muted">Available balance</span>
              <span className={`font-medium ${canAfford ? 'text-brand-green' : 'text-brand-red'}`}>
                {formatCurrency(profile?.balance || 0)}
              </span>
            </div>
            {orderType === 'SELL' && stock.userQuantity !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-dark-muted">Shares held</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {stock.userQuantity}
                </span>
              </div>
            )}
          </div>

          {/* Warnings */}
          {orderType === 'BUY' && !canAfford && (
            <p className="text-xs text-brand-red">Insufficient balance for this order</p>
          )}
          {orderType === 'SELL' && stock.userQuantity < quantity && (
            <p className="text-xs text-brand-red">You don't have enough shares to sell</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-6">
          <button
            onClick={handleSubmit}
            disabled={
              placeOrder.isPending ||
              (orderType === 'BUY' && !canAfford) ||
              (orderType === 'SELL' && stock.userQuantity < quantity)
            }
            className={`w-full py-3 rounded-lg text-white font-medium text-sm transition-colors disabled:opacity-50
              ${orderType === 'BUY'
                ? 'bg-brand-green hover:bg-green-600'
                : 'bg-brand-red hover:bg-red-600'
              }`}
          >
            {placeOrder.isPending
              ? 'Placing order...'
              : `${orderType} ${quantity} share${quantity > 1 ? 's' : ''} · ${formatCurrency(totalCost)}`
            }
          </button>
        </div>
      </div>
    </>
  )
}