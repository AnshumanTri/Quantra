import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { create } from 'zustand'

// Zustand store for live prices — shared across all components
export const useLivePrices = create((set) => ({
  prices: {},
  prevPrices: {},
  updatePrices: (newPrices) =>
    set((state) => ({
      prevPrices: { ...state.prices },
      prices: { ...state.prices, ...newPrices },
    })),
}))

// Singleton socket instance — only one connection for the whole app
let socket = null

export function useSocket(symbols = []) {
  const { updatePrices } = useLivePrices()
  const symbolsRef = useRef(symbols)

  useEffect(() => {
    symbolsRef.current = symbols
  }, [symbols])

  useEffect(() => {
    // Create socket connection once
    if (!socket) {
      socket = io('http://localhost:5000', {
        transports: ['websocket'],
      })

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id)
      })

      socket.on('price_update', (data) => {
        updatePrices(data)
      })

      socket.on('disconnect', () => {
        console.log('Socket disconnected')
      })
    }

    // Subscribe to symbols
    if (symbols.length > 0) {
      socket.emit('subscribe', symbols)
    }

    return () => {
      // Unsubscribe when component unmounts
      if (symbols.length > 0) {
        socket.emit('unsubscribe', symbols)
      }
    }
  }, [symbols.join(',')])
}