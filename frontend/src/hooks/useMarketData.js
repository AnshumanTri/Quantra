import { useQuery } from '@tanstack/react-query'
import axiosInstance from '../api/axiosInstance'

// Fetch quotes for multiple symbols
// Refetches every 15 seconds automatically — simulates live prices
export const useQuotes = (symbols = []) =>
  useQuery({
    queryKey: ['quotes', symbols.join(',')],
    queryFn: async () => {
      if (symbols.length === 0) return {}
      const { data } = await axiosInstance.get(
        `/market/quotes?symbols=${symbols.join(',')}`
      )
      return data.quotes
    },
    enabled: symbols.length > 0,
    refetchInterval: 15000, // refetch every 15 seconds
    staleTime: 10000,
  })

// Fetch OHLC candle data for chart page
export const useOHLC = (symbol, interval = '1D') =>
  useQuery({
    queryKey: ['ohlc', symbol, interval],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/market/ohlc/${symbol}?interval=${interval}`
      )
      return data.candles
    },
    enabled: !!symbol,
    staleTime: 30000,
  })

// Search stocks
export const useStockSearch = (query) =>
  useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/market/search?q=${query}`)
      return data.results
    },
    enabled: query.length > 1,
    staleTime: 60000,
  })