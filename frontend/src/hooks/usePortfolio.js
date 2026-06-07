import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../api/axiosInstance'

// Fetch holdings
export const useHoldings = () =>
  useQuery({
    queryKey: ['holdings'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/portfolio/holdings')
      return data.holdings
    },
  })

// Fetch orders
export const useOrders = () =>
  useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/portfolio/orders')
      return data.orders
    },
  })

// Fetch watchlist
export const useWatchlist = () =>
  useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/portfolio/watchlist')
      return data.watchlist
    },
  })

// Fetch user profile + balance
export const useProfile = () =>
  useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/portfolio/profile')
      return data.user
    },
  })

// Add to watchlist
export const useAddWatchlist = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (item) => axiosInstance.post('/portfolio/watchlist', item),
    onSuccess: () => queryClient.invalidateQueries(['watchlist']),
  })
}

// Remove from watchlist
export const useRemoveWatchlist = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (symbol) => axiosInstance.delete(`/portfolio/watchlist/${symbol}`),
    onSuccess: () => queryClient.invalidateQueries(['watchlist']),
  })
}


// Place a buy or sell order
export const usePlaceOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderData) => axiosInstance.post('/orders/place', orderData),
    onSuccess: () => {
      // Refresh all affected data after order
      queryClient.invalidateQueries(['holdings'])
      queryClient.invalidateQueries(['orders'])
      queryClient.invalidateQueries(['profile'])
    },
  })
}