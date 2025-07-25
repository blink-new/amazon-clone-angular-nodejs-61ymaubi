import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Ticket, User, ShoppingCart, Settings, BarChart3 } from 'lucide-react'
import { blink } from '@/blink/client'

interface HeaderProps {
  cartCount?: number
  onCartClick?: () => void
  onNavigate?: (page: string) => void
}

export function Header({ cartCount = 0, onCartClick, onNavigate }: HeaderProps) {
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
    })
    return unsubscribe
  }, [])

  const handleLogin = () => {
    blink.auth.login()
  }

  const handleLogout = () => {
    blink.auth.logout()
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Button
            variant="ghost"
            onClick={() => onNavigate?.('events')}
            className="flex items-center space-x-2 p-2 hover:bg-transparent"
          >
            <Ticket className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">TicketHub</span>
          </Button>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search events, venues, or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onCartClick}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            {/* Navigation */}
            {user && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate?.('dashboard')}
                >
                  <User className="h-4 w-4 mr-2" />
                  My Bookings
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate?.('admin')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </div>
            )}

            {/* User Actions */}
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{user.email}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Button onClick={handleLogin} size="sm">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}