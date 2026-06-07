import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import MarketTicker from '../market/MarketTicker'

export default function AppShell() {
  return (
    <div className="flex flex-col h-screen overflow-hidden"
         style={{ background: 'var(--color-light-bg)' }}
    >
      {/* Top ticker bar */}
      <MarketTicker />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <Sidebar />

        {/* Content area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-5">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}