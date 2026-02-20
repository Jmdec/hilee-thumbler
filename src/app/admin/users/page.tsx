"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import type React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/store/authStore"
import {
  MoreHorizontal,
  Eye,
  Search,
  Loader2,
  ArrowUpDown,
  Mail,
  Phone,
  MapPin,
  Calendar,
  UserCheck,
  UsersIcon,
  ShoppingBag,
  UserX,
  Send,
  User,
  Users,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from "@tanstack/react-table"

interface User {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  zip_code?: string
  role: string
  created_at: string
  updated_at: string
}

interface Order {
  id: number
  order_number: string
  user_id: number
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_address: string
  delivery_city: string
  delivery_zip_code: string
  payment_method: string
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
  subtotal: number
  delivery_fee: number
  total_amount: number
  notes?: string
  receipt_file?: string
  items: OrderItem[]
  created_at: string
  updated_at: string
}

interface OrderItem {
  id: number
  name: string
  description: string
  price: number
  quantity: number
  category: string
  is_spicy: boolean
  is_vegetarian: boolean
  image_url: string
}

const purpleGrad = "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)"

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const [userOrders, setUserOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [showOrdersDialog, setShowOrdersDialog] = useState(false)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [sendingEmail, setSendingEmail] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null)
  const [deactivatingUser, setDeactivatingUser] = useState(false)

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const tokenFromStore = useAuthStore((state) => state.token)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = tokenFromStore || localStorage.getItem("auth_token")
      if (!token) {
        toast({ variant: "destructive", title: "Authentication Required", description: "Please log in to access users." })
        router.push("/login")
        return
      }
      const params = new URLSearchParams({ per_page: "100", role: "user" })
      if (globalFilter) params.set("search", globalFilter)
      const response = await fetch(`/api/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      if (!response.ok) {
        if (response.status === 401) { localStorage.removeItem("auth_token"); router.push("/login"); return }
        throw new Error(`HTTP ${response.status}`)
      }
      const result = await response.json()
      if (result.success) {
        const usersData = (result.data && result.data.data) || result.data || []
        setUsers(Array.isArray(usersData) ? usersData : [])
      } else throw new Error(result.message || "Failed to fetch users")
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Failed to load users." })
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])
  useEffect(() => {
    const id = setTimeout(() => { if (globalFilter !== undefined) fetchUsers() }, 500)
    return () => clearTimeout(id)
  }, [globalFilter])

  const fetchUserOrders = async (userId: number) => {
    try {
      setLoadingOrders(true)
      const token = localStorage.getItem("auth_token")
      if (!token) return
      const response = await fetch(`/api/orders?user_id=${userId}&per_page=100`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const result = await response.json()
      if (result.success) {
        setUserOrders(Array.isArray(result.data) ? result.data : result.data?.data || [])
      } else throw new Error(result.message || "Failed to fetch orders")
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Failed to load user orders." })
      setUserOrders([])
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleViewUser = (user: User) => { setSelectedUser(user); setShowUserDialog(true) }
  const handleViewOrders = (user: User) => { setSelectedUser(user); setShowOrdersDialog(true); fetchUserOrders(user.id) }
  const handleSendEmail = (user: User) => { setSelectedUser(user); setEmailSubject(""); setEmailMessage(""); setShowEmailDialog(true) }

  const sendEmail = async () => {
    if (!selectedUser || !emailSubject || !emailMessage) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please fill in both subject and message." })
      return
    }
    try {
      setSendingEmail(true)
      const token = localStorage.getItem("auth_token")
      if (!token) return
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ to: selectedUser.email, subject: emailSubject, message: emailMessage }),
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: "Unknown error" }))
        throw new Error(err.message || `HTTP ${response.status}`)
      }
      toast({ title: "Email Sent", description: `Email successfully sent to ${selectedUser.name}` })
      setShowEmailDialog(false)
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Failed to send email." })
    } finally {
      setSendingEmail(false)
    }
  }

  const handleDeactivateUser = (user: User) => { setUserToDeactivate(user); setShowDeactivateDialog(true) }

  const deactivateUser = async () => {
    if (!userToDeactivate) return
    try {
      setDeactivatingUser(true)
      const token = localStorage.getItem("auth_token")
      if (!token) return
      const response = await fetch(`/api/users/${userToDeactivate.id}/deactivate`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "deactivated" }),
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: "Unknown error" }))
        throw new Error(err.message || `HTTP ${response.status}`)
      }
      toast({ title: "User Deactivated", description: `${userToDeactivate.name} has been deactivated successfully.` })
      setShowDeactivateDialog(false)
      setUserToDeactivate(null)
      fetchUsers()
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error instanceof Error ? error.message : "Failed to deactivate user." })
    } finally {
      setDeactivatingUser(false)
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="p-0 h-auto font-semibold text-purple-900 hover:text-purple-700">
          ID <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full text-xs">
          #{row.original.id}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="p-0 h-auto font-semibold text-purple-900 hover:text-purple-700">
          Name <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 truncate">{row.original.name}</div>
          <div className="text-xs text-purple-500 truncate">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: () => <span className="font-semibold text-purple-900">Phone</span>,
      cell: ({ row }) => <div className="text-sm text-gray-600 hidden lg:block">{row.original.phone || "—"}</div>,
    },
    {
      accessorKey: "city",
      header: () => <span className="font-semibold text-purple-900">City</span>,
      cell: ({ row }) => <div className="text-sm text-gray-600 hidden lg:block">{row.original.city || "—"}</div>,
    },
    {
      accessorKey: "role",
      header: () => <span className="font-semibold text-purple-900">Role</span>,
      cell: () => (
        <Badge className="text-xs bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200">
          User
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="p-0 h-auto font-semibold text-purple-900 hover:text-purple-700 hidden lg:flex">
          Joined <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-gray-600 hidden lg:block">
          {new Date(row.original.created_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-1">
            <Dialog open={showUserDialog} onOpenChange={(open) => !open && setShowUserDialog(false)}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewUser(user)}
                  className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3 rounded-lg text-purple-600 hover:text-purple-800 hover:bg-purple-100 transition-all"
                >
                  <Eye className="h-4 w-4" />
                  <span className="ml-1 sr-only sm:not-sr-only hidden sm:inline text-xs font-medium">View</span>
                </Button>
              </DialogTrigger>

              {selectedUser?.id === user.id && (
                <DialogContent className="w-full sm:max-w-2xl overflow-y-auto border-purple-200">
                  <DialogHeader>
                    <DialogTitle className="text-purple-900">User Details — {selectedUser.name}</DialogTitle>
                    <DialogDescription className="text-purple-500">Complete information for this user</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <Card className="gap-0 p-0 border-purple-200 shadow-lg">
                      <CardHeader className="p-4 rounded-t-lg" style={{ background: "linear-gradient(135deg, #7c3aed, #a21caf)" }}>
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-white">
                          <UserCheck className="w-5 h-5" /> Personal Information
                        </h3>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide">Full Name</p>
                            <p className="font-semibold text-gray-900 mt-1">{selectedUser.name}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide">Role</p>
                            <Badge className="mt-1 bg-purple-100 text-purple-700 border-purple-300">{selectedUser.role}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm bg-purple-50 p-3 rounded-lg">
                          <Mail className="w-4 h-4 text-purple-400" />
                          <p className="text-gray-700">{selectedUser.email}</p>
                        </div>
                        {selectedUser.phone && (
                          <div className="flex items-center gap-2 text-sm bg-purple-50 p-3 rounded-lg">
                            <Phone className="w-4 h-4 text-purple-400" />
                            <p className="text-gray-700">{selectedUser.phone}</p>
                          </div>
                        )}
                        {selectedUser.address && (
                          <div className="flex items-start gap-2 text-sm bg-purple-50 p-3 rounded-lg">
                            <MapPin className="w-4 h-4 text-purple-400 mt-0.5" />
                            <div>
                              <p className="text-gray-700">{selectedUser.address}</p>
                              {selectedUser.city && selectedUser.zip_code && (
                                <p className="text-purple-500 text-xs mt-0.5">{selectedUser.city}, {selectedUser.zip_code}</p>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm pt-3 border-t border-purple-100">
                          <Calendar className="w-4 h-4 text-purple-400" />
                          <p className="text-gray-600">
                            Joined on{" "}
                            {new Date(selectedUser.created_at).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" })}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </DialogContent>
              )}
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-purple-500 hover:bg-purple-100 hover:text-purple-700">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-purple-200 shadow-xl">
                <DropdownMenuLabel className="text-purple-700">User Actions</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-purple-100" />
                <DropdownMenuItem onClick={() => handleViewOrders(user)} className="hover:bg-purple-50 focus:bg-purple-50 cursor-pointer">
                  <ShoppingBag className="mr-2 h-4 w-4 text-purple-500" /> View Orders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSendEmail(user)} className="hover:bg-purple-50 focus:bg-purple-50 cursor-pointer">
                  <Send className="mr-2 h-4 w-4 text-purple-500" /> Send Email
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-purple-100" />
                <DropdownMenuItem className="text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer" onClick={() => handleDeactivateUser(user)}>
                  <UserX className="mr-2 h-4 w-4" /> Deactivate User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { columnFilters, globalFilter, rowSelection },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
  })

  const purpleBg = { background: "linear-gradient(160deg, #1e0a3c 0%, #2d1057 40%, #1a0a2e 100%)" }

  if (loading) {
    return (
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex min-h-screen w-full" style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #fdf4ff 100%)" }}>
          <AppSidebar />
          <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-72"}`}>
            <div className="flex items-center justify-center min-h-screen">
              <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-2xl border border-purple-100">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                <span className="text-purple-800 font-semibold">Loading users...</span>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div
        className="flex min-h-screen w-full"
        style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #fdf4ff 50%, #f3e8ff 100%)" }}
      >
        <AppSidebar />
        <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-64"}`}>

          {/* Mobile topbar */}
          {isMobile && (
            <div
              className="sticky top-0 z-50 flex h-12 items-center gap-2 border-b px-4 shadow-sm"
              style={{ background: "rgba(124,58,237,0.97)", borderColor: "rgba(168,85,247,0.3)" }}
            >
              <SidebarTrigger className="-ml-1 text-white" />
              <span className="text-sm font-bold text-white">Users</span>
            </div>
          )}

          <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
            <div className="max-w-full space-y-6">

              {/* Header */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-stretch justify-between">
                <div
                  className="rounded-2xl px-7 py-6 shadow-xl relative overflow-hidden"
                  style={{ background: purpleGrad }}
                >
                  <div className="absolute right-4 top-4 w-20 h-20 rounded-full opacity-10 pointer-events-none"
                    style={{ background: "radial-gradient(circle, white, transparent)" }} />
                  <div className="flex items-center gap-3">
                    <User className="w-7 h-7 text-white opacity-90" />
                    <div>
                      <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
                      <p className="text-violet-200 text-sm mt-0.5">Manage customer accounts and information</p>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-2xl px-6 py-5 shadow-xl flex items-center gap-4 bg-white/90 border"
                  style={{ borderColor: "rgba(139,92,246,0.15)" }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                    style={{ background: purpleGrad }}
                  >
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-purple-500 uppercase tracking-widest">Total Customers</p>
                    <p className="text-3xl font-bold text-purple-900 leading-tight">{users.length}</p>
                  </div>
                </div>
              </div>

              {/* Table Card */}
              <div
                className="rounded-2xl shadow-2xl overflow-hidden border"
                style={{ borderColor: "rgba(168,85,247,0.2)", background: "rgba(255,255,255,0.92)" }}
              >
                {/* Card Header */}
                <div className="px-6 py-5" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #a21caf 100%)" }}>
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div>
                      <h2 className="text-white font-bold text-lg">All Users</h2>
                      <p className="text-purple-200 text-xs mt-0.5">
                        Showing {table.getFilteredRowModel().rows.length} of {users.length} users
                      </p>
                    </div>
                    <div className="relative max-w-xs w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300" />
                      <Input
                        placeholder="Search users..."
                        value={globalFilter || ""}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-9 pr-3 py-2 w-full text-white placeholder:text-purple-300 border-0 rounded-xl focus-visible:ring-2 focus-visible:ring-white/40"
                        style={{ background: "rgba(255,255,255,0.15)" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr style={{ background: "linear-gradient(135deg, #f5f3ff, #fdf4ff)" }}>
                        {table.getHeaderGroups().map((hg) =>
                          hg.headers.map((header) => (
                            <th
                              key={header.id}
                              className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider border-b"
                              style={{ borderColor: "rgba(168,85,247,0.15)", color: "#6d28d9" }}
                            >
                              {header.isPlaceholder ? null : (
                                typeof header.column.columnDef.header === "function"
                                  ? header.column.columnDef.header(header.getContext())
                                  : header.column.columnDef.header
                              )}
                            </th>
                          ))
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.map((row, index) => (
                        <tr
                          key={row.id}
                          className="transition-all duration-150 border-b group"
                          style={{
                            background: index % 2 === 0 ? "white" : "rgba(245,243,255,0.5)",
                            borderColor: "rgba(168,85,247,0.08)",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(237,233,254,0.6)" }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = index % 2 === 0 ? "white" : "rgba(245,243,255,0.5)" }}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-4 py-3 text-xs sm:text-sm">
                              {typeof cell.column.columnDef.cell === "function"
                                ? cell.column.columnDef.cell(cell.getContext())
                                : (cell.getValue() as React.ReactNode)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {table.getRowModel().rows.length === 0 && (
                  <div className="text-center py-16">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #a21caf)" }}
                    >
                      <UsersIcon className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-lg font-semibold text-purple-900">No users found</p>
                    {globalFilter && <p className="text-sm text-purple-400 mt-1">Try adjusting your search terms</p>}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Orders Dialog */}
      <Dialog open={showOrdersDialog} onOpenChange={setShowOrdersDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto border-purple-200">
          <DialogHeader>
            <DialogTitle className="text-purple-900">Orders for {selectedUser?.name}</DialogTitle>
            <DialogDescription className="text-purple-500">View all orders placed by this customer</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {loadingOrders ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                <span className="ml-2 text-purple-700 font-medium">Loading orders...</span>
              </div>
            ) : userOrders.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "linear-gradient(135deg, #7c3aed, #a21caf)" }}>
                  <ShoppingBag className="w-7 h-7 text-white" />
                </div>
                <p className="font-semibold text-purple-900">No orders found for this user</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders.map((order) => (
                  <Card key={order.id} className="border-purple-200 shadow-md overflow-hidden">
                    <div className="h-1" style={{ background: "linear-gradient(90deg, #7c3aed, #a21caf)" }} />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <p className="font-bold text-purple-900 text-lg">Order #{order.order_number}</p>
                            <Badge
                              className={`text-xs ${order.status === "delivered" ? "bg-green-100 text-green-700 border-green-300" : order.status === "cancelled" ? "bg-red-100 text-red-700 border-red-300" : "bg-purple-100 text-purple-700 border-purple-300"}`}
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-purple-400" />
                              <p>{order.delivery_address}</p>
                            </div>
                            {order.delivery_city && (
                              <p className="ml-6 text-xs text-purple-400">{order.delivery_city}, {order.delivery_zip_code}</p>
                            )}
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-purple-400" />
                              <p>{order.customer_phone}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-purple-400" />
                              <p className="text-xs">{new Date(order.created_at).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-2xl text-purple-700">₱{order.total_amount.toFixed(2)}</p>
                          <p className="text-xs text-gray-400 mt-1">Subtotal: ₱{order.subtotal.toFixed(2)}</p>
                          <p className="text-xs text-gray-400">Delivery: ₱{order.delivery_fee.toFixed(2)}</p>
                          <Badge className="mt-2 text-xs bg-purple-50 text-purple-600 border-purple-200">{order.payment_method}</Badge>
                        </div>
                      </div>
                      {order.items && order.items.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-purple-100">
                          <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-3">Order Items ({order.items.length})</p>
                          <div className="space-y-2">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex items-center gap-3 text-sm p-3 rounded-xl" style={{ background: "rgba(245,243,255,0.8)" }}>
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">{item.name}</p>
                                  <p className="text-xs text-gray-500">{item.description}</p>
                                  <div className="flex gap-1 mt-1 flex-wrap">
                                    <Badge className="text-xs bg-purple-100 text-purple-600 border-purple-200">{item.category}</Badge>
                                    {item.is_spicy && <Badge className="text-xs bg-red-100 text-red-600 border-red-200">Spicy</Badge>}
                                    {item.is_vegetarian && <Badge className="text-xs bg-green-100 text-green-600 border-green-200">Veg</Badge>}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-700">₱{item.price.toFixed(2)}</p>
                                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                  <p className="font-bold text-purple-700">₱{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {order.notes && (
                        <div className="mt-4 pt-4 border-t border-purple-100">
                          <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">Special Notes</p>
                          <p className="text-sm text-gray-600 bg-amber-50 border border-amber-200 p-3 rounded-lg">{order.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="border-purple-200">
          <DialogHeader>
            <DialogTitle className="text-purple-900">Send Email to {selectedUser?.name}</DialogTitle>
            <DialogDescription className="text-purple-400">Compose and send an email to this customer</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label htmlFor="email-to" className="text-purple-700 font-semibold text-xs uppercase tracking-wide">To</Label>
              <Input id="email-to" value={selectedUser?.email || ""} disabled className="mt-1 bg-purple-50 border-purple-200 text-purple-700" />
            </div>
            <div>
              <Label htmlFor="email-subject" className="text-purple-700 font-semibold text-xs uppercase tracking-wide">Subject</Label>
              <Input
                id="email-subject"
                placeholder="Enter email subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="mt-1 border-purple-200 focus-visible:ring-purple-400"
              />
            </div>
            <div>
              <Label htmlFor="email-message" className="text-purple-700 font-semibold text-xs uppercase tracking-wide">Message</Label>
              <Textarea
                id="email-message"
                placeholder="Enter your message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                className="mt-1 min-h-[140px] border-purple-200 focus-visible:ring-purple-400"
              />
            </div>
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setShowEmailDialog(false)} disabled={sendingEmail} className="border-purple-200 text-purple-600 hover:bg-purple-50">
              Cancel
            </Button>
            <Button
              onClick={sendEmail}
              disabled={sendingEmail || !emailSubject || !emailMessage}
              className="text-white font-semibold rounded-xl px-5 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a21caf)" }}
            >
              {sendingEmail ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
              ) : (
                <><Send className="mr-2 h-4 w-4" />Send Email</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Dialog */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent className="border-red-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Deactivate this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the account for <strong className="text-purple-700">{userToDeactivate?.name}</strong>. They will no longer be able to log in, but their data will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivatingUser} className="border-purple-200 text-purple-600 hover:bg-purple-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deactivateUser}
              disabled={deactivatingUser}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
            >
              {deactivatingUser ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deactivating...</>
              ) : "Deactivate User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}