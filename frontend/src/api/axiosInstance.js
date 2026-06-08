import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
})

// Attach JWT token to every request automatically
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('quantra_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// If token expired, redirect to login
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('quantra_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance