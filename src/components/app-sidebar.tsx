"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Flame,
  TrendingUp,
  Mail,
  Menu,
  X,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: Home,
    color: "text-purple-600",
    bgColor: "hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-50",
  },
  {
    title: "Products",
    url: "/admin/product",
    icon: Package,
    color: "text-purple-700",
    bgColor: "hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-50",
  },
  {
    title: "Orders",
    url: "/admin/order",
    icon: ShoppingCart,
    color: "text-purple-600",
    bgColor: "hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-50",
  },
  {
    title: "Inbox",
    url: "/admin/contacts",
    icon: Mail,
    color: "text-purple-600",
    bgColor: "hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-50",
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
    color: "text-purple-600",
    bgColor: "hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-50",
  },
  {
    title: "Reports",
    url: "/admin/reports",
    icon: BarChart3,
    color: "text-purple-700",
    bgColor: "hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-50",
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
    color: "text-purple-600",
    bgColor: "hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-50",
  },
]

// ── Unchanged original AppSidebar ──────────────────────────────────────────
export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    router.push("/login")
  }

  return (
    <Sidebar className="border-r border-purple-200">
      <SidebarContent className="bg-purple-200 py-3">
        <SidebarGroup>
          <div className="px-4 py-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg mx-3 mt-3 mb-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <SidebarGroupLabel className="text-white font-bold text-lg">Hilee Admin</SidebarGroupLabel>
                <p className="text-purple-100 text-xs">Management Portal</p>
              </div>
            </div>
          </div>

          <SidebarGroupContent className="px-2">
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className={`${item.bgColor} transition-all duration-200 rounded-lg mx-1 group hover:shadow-sm ${
                      pathname === item.url
                        ? "bg-gradient-to-r from-purple-100 to-purple-100 border-l-4 border-purple-600"
                        : ""
                    }`}
                  >
                    <Link href={item.url || "#"} className="flex items-center gap-3">
                      <item.icon className={`h-5 w-5 ${item.color} group-hover:scale-110 transition-transform`} />
                      <span className="font-medium">{item.title}</span>
                      {pathname === item.url && (
                        <TrendingUp className="ml-auto h-4 w-4 text-purple-600" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 bg-gradient-to-r from-purple-50 to-purple-50 border-t border-purple-200">
        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-gradient-to-r hover:from-purple-100 hover:to-purple-100 transition-all duration-200 rounded-lg group"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2 text-red-500 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}

// ── ResponsiveSidebar — use THIS in your layout instead of <AppSidebar /> ──
//
//  layout.tsx example:
//
//    import { ResponsiveSidebar } from "@/components/app-sidebar"
//
//    export default function AdminLayout({ children }) {
//      return (
//        <div className="flex min-h-screen">
//          <ResponsiveSidebar />
//          <main className="flex-1 pt-14 lg:pt-0">{children}</main>
//        </div>
//      )
//    }
//
export function ResponsiveSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* ── Mobile hamburger (hidden on lg+) ── */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-purple-600 text-white shadow-lg hover:bg-purple-700 active:scale-95 transition-all"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ── Desktop sidebar — always visible on lg+ ── */}
      <div className="hidden lg:block shrink-0">
        <AppSidebar />
      </div>

      {/* ── Mobile / tablet: backdrop ── */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* ── Mobile / tablet: slide-in drawer ── */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button floats over the sidebar header */}
        <button
          className="absolute top-5 right-3 z-10 p-1.5 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        >
          <X className="w-4 h-4" />
        </button>

        {/* AppSidebar — completely unchanged, rendered as-is */}
        <AppSidebar />
      </div>
    </>
  )
}