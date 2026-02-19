"use client"

import { useState, useEffect } from "react"
import { useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Menu, LogOut, Download, User, Home, Calendar, ChefHat, ShoppingCart, Package, BookOpen, Gift, MessageSquare, FolderClock } from "lucide-react"
import Image from "next/image"
import EventBookingModal from "@/components/event-booking-modal"
import GoogleTranslate from "@/components/googleTranslate"
import { useCartStore } from "@/store/cartStore"
import { useAuthStore } from "@/store/authStore"

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ id?: string | number; name?: string; email?: string; token?: string } | null>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const { getItemCount } = useCartStore()
  const itemCount = getItemCount()

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    }

    const handleAppInstalled = () => {
      setShowInstallButton(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallApp = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setShowInstallButton(false)
    }

    setDeferredPrompt(null)
  }

  const loadUserFromStorage = useCallback(() => {
    try {
      const storedUser = localStorage.getItem("user_data")
      const storedToken = localStorage.getItem("auth_token")

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser)
        setUser({ ...parsedUser, token: storedToken })
        console.log("[Header] User loaded from storage:", parsedUser)
      } else {
        setUser(null)
        console.log("[Header] No user data or token found")
      }
    } catch (error) {
      console.error("[Header] Error loading user from storage:", error)
      setUser(null)
    }
  }, [])

  useEffect(() => {
    loadUserFromStorage()

    const handleUserUpdate = () => {
      console.log("[Header] User update event received")
      loadUserFromStorage()
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user_data" || e.key === "auth_token") {
        console.log("[Header] Storage change detected for:", e.key)
        loadUserFromStorage()
      }
    }

    window.addEventListener("userDataUpdated", handleUserUpdate)
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("userDataUpdated", handleUserUpdate)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [loadUserFromStorage])

  if (pathname.startsWith("/admin")) {
    return null
  }

  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout() // handles localStorage cleanup + Zustand state
    setUser(null)
    window.dispatchEvent(new CustomEvent("userDataUpdated"))
    router.push("/login")
  }

  const allNav = [
    { name: "Home", href: "/", icon: Home },
    { name: "Menu", href: "/menu", icon: ChefHat },
    { name: "Reservations", href: "/reservations", icon: Calendar },
    { name: "Blog", href: "/blog", icon: BookOpen },
    { name: "Promos", href: "/promos", icon: Gift },
    { name: "Testimonials", href: "/testimonials", icon: MessageSquare },
    { name: "Contact Us", href: "/contact", icon: MessageSquare },
  ]

  const isActivePage = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-orange-100 shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 via-yellow-50/30 to-orange-50/50">
        <div className="absolute top-1 left-4 w-12 h-12 bg-gradient-to-br from-orange-200/40 to-yellow-200/30 rounded-full blur-xl opacity-60"></div>
        <div className="absolute top-2 right-8 w-8 h-8 bg-gradient-to-br from-yellow-200/40 to-orange-200/30 rounded-full blur-lg opacity-50"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 relative z-10">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group flex-shrink-0">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <Image src="/logonew.png" alt="Izakaya Tori Ichizu Logo" fill className="object-contain" />
            </div>
          </Link>

          {/* Mobile Quick Nav Icons - Show only on mobile, hide on desktop */}
          <div className="flex lg:hidden items-center gap-2 ml-2">
            {allNav.slice(0, 3).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`p-2 rounded-lg transition-all duration-300 ${isActivePage(item.href)
                  ? "bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-md"
                  : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                title={item.name}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>

          {/* Desktop Navigation - All buttons displayed */}
          <nav className="hidden lg:flex items-center space-x-1">
            {allNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg ${isActivePage(item.href)
                  ? "bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-md"
                  : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Right side actions - Simplified for mobile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Install button - Desktop only */}
            {showInstallButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleInstallApp}
                className="hidden md:flex items-center space-x-1 border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-600 bg-transparent text-xs"
              >
                <Download className="h-3 w-3" />
                <span>Install</span>
              </Button>
            )}

            {/* Google Translate - Desktop only */}
            <div className="hidden md:block">
              <GoogleTranslate />
            </div>

            {/* Event Booking - Desktop only - Positioned right of Google Translate */}
            <div className="hidden md:block">
              <EventBookingModal />
            </div>

            {/* NEW: External Action Buttons - Desktop only, show when user is logged in */}
            {user && (
              <>
                {/* Cart Button */}
                <Link href="/cart" className="hidden md:block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="relative border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700 transition-all duration-300 p-2 h-10 w-10"
                    title="Cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 px-1.5 min-w-[18px] h-5 flex items-center justify-center text-xs bg-orange-600 text-white border-2 border-white shadow-md animate-pulse font-bold">
                        {itemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* Events Button */}
                <Link href="/events-history" className="hidden md:block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700 transition-all duration-300 p-2 h-10 w-10"
                    title="Events"
                  >
                    <FolderClock className="h-5 w-5" />
                  </Button>
                </Link>

                {/* Reservations Button */}
                <Link href="/reservation-history" className="hidden md:block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700 transition-all duration-300 p-2 h-10 w-10"
                    title="Reservations"
                  >
                    <Calendar className="h-5 w-5" />
                  </Button>
                </Link>
              </>
            )}

            {user ? (
              <div className="relative group">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="relative bg-gradient-to-r from-orange-600 to-orange-700 border-orange-300 text-white hover:from-orange-700 hover:to-orange-800 transition-all duration-300 shadow-sm hover:shadow-md p-2 h-10 w-10 lg:hover:bg-gradient-to-r"
                >
                  <User className="h-5 w-5" />
                </Button>

                <div
                  className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-orange-100 py-2 z-50 transition-all duration-200 ${isDropdownOpen
                    ? "opacity-100 visible"
                    : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
                    }`}
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>

                  <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className="block">
                    <div className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">Profile</span>
                    </div>
                  </Link>

                  {/* Menu Items */}
                  <Link href="/cart" onClick={() => setIsDropdownOpen(false)} className="block">
                    <div className="flex items-center justify-between px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <ShoppingCart className="h-4 w-4" />
                        <span className="text-sm font-medium">Cart</span>
                      </div>
                      {itemCount > 0 && (
                        <Badge className="bg-orange-600 text-white px-2 py-0.5 text-xs">{itemCount}</Badge>
                      )}
                    </div>
                  </Link>

                  <Link href="/orders" onClick={() => setIsDropdownOpen(false)} className="block">
                    <div className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer">
                      <Package className="h-4 w-4" />
                      <span className="text-sm font-medium">Orders</span>
                    </div>
                  </Link>

                  {/* Events Link */}
                  <Link href="/events-history" onClick={() => setIsDropdownOpen(false)} className="block">
                    <div className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer">
                      <FolderClock className="h-4 w-4" />
                      <span className="text-sm font-medium">Events</span>
                    </div>
                  </Link>

                  {/* Reservations Link */}
                  <Link href="/reservation-history" onClick={() => setIsDropdownOpen(false)} className="block">
                    <div className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Reservations</span>
                    </div>
                  </Link>

                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsDropdownOpen(false)
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="hidden md:flex">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-gradient-to-r from-orange-600 to-orange-700 text-white text-xs px-3 py-1.5 h-8"
                >
                  Login
                </Button>
              </Link>
            )}

            {/* Mobile Menu - Hamburger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 p-2 h-12 w-12"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-white border-l border-gray-200 p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Menu Header */}
                  <div className="flex items-center space-x-3 p-4 border-b border-gray-100">
                    <div className="relative w-12 h-12 overflow-hidden shadow-md flex-shrink-0">
                      <Image src="/logo.png" alt="Izakaya Logo" fill className="object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-gray-800 text-sm">Izakaya Tori Ichizu</h2>
                      <p className="text-xs text-orange-600">Japanese Izakaya</p>
                    </div>
                  </div>

                  {showInstallButton && (
                    <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-orange-100">
                      <Button
                        onClick={() => {
                          handleInstallApp()
                          setIsOpen(false)
                        }}
                        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800 py-3 rounded-lg transition-all duration-300 text-base font-semibold shadow-md hover:shadow-lg"
                      >
                        <Download className="h-5 w-5" />
                        <span>Install App</span>
                      </Button>
                    </div>
                  )}

                  {/* Mobile Menu Content */}
                  <div className="flex-1 overflow-y-auto py-4">
                    {/* Google Translate - Mobile */}
                    <div className="px-4 pb-4 border-b border-gray-100">
                      <GoogleTranslate />
                    </div>

                    {/* All Navigation Items */}
                    <nav className="py-2">
                      <div className="space-y-1 px-2">
                        {allNav.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center space-x-3 w-full text-left px-3 py-3 text-base font-medium rounded-lg transition-all duration-300 ${isActivePage(item.href)
                              ? "bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-md"
                              : "text-gray-700 hover:bg-gray-50 hover:text-orange-600"
                              }`}
                          >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            <span>{item.name}</span>
                          </Link>
                        ))}
                      </div>
                    </nav>

                    {/* Quick Actions */}
                    <div className="py-4 border-t border-gray-100">
                      <h3 className="text-xs font-semibold text-gray-600 mb-3 px-4 uppercase tracking-wide">
                        Quick Actions
                      </h3>
                      <div className="space-y-2 px-2">
                        <div className="px-3 py-3">
                          <EventBookingModal />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Menu Footer */}
                  <div className="border-t border-gray-100 p-4 space-y-3">
                    {user ? (
                      <>
                        <Link href="/orders" onClick={() => setIsOpen(false)}>
                          <div className="flex items-center space-x-3 px-3 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                            <Package className="h-5 w-5 text-gray-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800">Orders</p>
                              <p className="text-xs text-gray-500">View your orders</p>
                            </div>
                          </div>
                        </Link>

                        {/* Events Link - Mobile */}
                        <Link href="/events-history" onClick={() => setIsOpen(false)}>
                          <div className="flex items-center space-x-3 px-3 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                            <FolderClock className="h-5 w-5 text-gray-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800">Events</p>
                              <p className="text-xs text-gray-500">View your events</p>
                            </div>
                          </div>
                        </Link>

                        {/* Reservations Link - Mobile */}
                        <Link href="/reservation-history" onClick={() => setIsOpen(false)}>
                          <div className="flex items-center space-x-3 px-3 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                            <Calendar className="h-5 w-5 text-gray-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800">Reservations</p>
                              <p className="text-xs text-gray-500">View your reservations</p>
                            </div>
                          </div>
                        </Link>

                        <Link href="/cart" onClick={() => setIsOpen(false)}>
                          <div className="flex items-center justify-between px-3 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                            <div className="flex items-center space-x-3">
                              <ShoppingCart className="h-5 w-5 text-gray-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800">Cart</p>
                                <p className="text-xs text-gray-500">Review your items</p>
                              </div>
                            </div>
                            {itemCount > 0 && (
                              <Badge className="bg-orange-600 text-white px-2 py-1 text-xs">{itemCount}</Badge>
                            )}
                          </div>
                        </Link>
                        <div className="px-3 py-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-800 mb-1">Hello, {user.name}!</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleLogout()
                            setIsOpen(false)
                          }}
                          className="flex items-center justify-center space-x-2 w-full border-red-300 text-red-600 hover:bg-red-50 py-2.5 text-sm font-medium"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </Button>
                      </>
                    ) : (
                      <Link href="/login" onClick={() => setIsOpen(false)} className="block">
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-2.5 font-semibold text-sm"
                        >
                          Login
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
