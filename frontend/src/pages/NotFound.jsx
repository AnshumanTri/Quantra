import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-brand-blue mb-4">404</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Page not found</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-brand-blue text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}