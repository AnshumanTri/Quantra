import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => {
        set({ token: null, user: null })
        localStorage.removeItem('quantra_token')
      },
    }),
    { name: 'quantra-auth' }
  )
)

export default useAuthStore