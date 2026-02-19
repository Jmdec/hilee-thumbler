"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import type React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Search, Loader2, Package, ChevronLeft, ChevronRight } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { useState, useEffect, useRef, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"

// Contact data type
interface Contact {
  id: number
  name: string
  email: string
  phone?: string
  message?: string
  created_at: string
  updated_at: string
}

export default function ContactsAdminPage() {
  const [contacts, setContacts] = useState<Contact[]>([])

  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/contact")
      const result = await response.json()
      if (response.ok) {
        setContacts(result.data)
      } else {
        throw new Error(result.message || "Failed to fetch contacts")
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load contacts" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const columns: ColumnDef<Contact>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-semibold text-gray-900 text-sm">{row.original.name}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div className="text-sm text-gray-700">{row.original.email}</div>,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <div className="text-sm text-gray-700">{row.original.phone || "-"}</div>,
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => <div className="text-sm text-gray-700 truncate max-w-[200px]">{row.original.message || "-"}</div>,
    },
    {
      accessorKey: "created_at",
      header: "Created On",
      cell: ({ row }) => <div className="text-xs text-gray-500">{new Date(row.original.created_at).toLocaleDateString()}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedContact(row.original)
              setIsViewDialogOpen(true)
            }}
          >
            <Eye className="w-4 h-4 mr-1" /> View
          </Button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: contacts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { columnFilters, globalFilter, rowSelection, sorting },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
  })

  const filteredRows = table.getFilteredRowModel().rows
  const totalItems = filteredRows.length
  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(totalItems / itemsPerPage)
  const startIndex = itemsPerPage === -1 ? 0 : (currentPage - 1) * itemsPerPage
  const endIndex = itemsPerPage === -1 ? totalItems : startIndex + itemsPerPage
  const paginatedRows = itemsPerPage === -1 ? filteredRows : filteredRows.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage, globalFilter])

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(value === "all" ? -1 : parseInt(value))
  }

  if (loading) {
    return (
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex min-h-screen w-full bg-gradient-to-br from-violet-50 to-red-50">
          <AppSidebar />
          <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-72"}`}>
            <div className="flex items-center justify-center min-h-screen w-full">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
                <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                <span className="text-gray-700 font-medium">Loading contacts...</span>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-violet-50 to-red-50">
        <AppSidebar />
        <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-72"}`}>
          {isMobile && (
            <div className="sticky top-0 z-50 flex h-12 items-center gap-2 border-b bg-white/90 backdrop-blur-sm px-4 md:hidden shadow-sm">
              <SidebarTrigger className="-ml-1" />
              <span className="text-sm font-semibold bg-gradient-to-r from-violet-600 to-red-600 bg-clip-text text-transparent">Contacts</span>
            </div>
          )}
          <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
            <div className="max-w-full space-y-4 sm:space-y-6">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-violet-100">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-600 to-red-600 bg-clip-text text-transparent">
                  Inbox Management
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Streamline all incoming contacts.</p>
              </div>

              <Card className="gap-0 p-0 bg-white/70 backdrop-blur-sm shadow-xl border-violet-100">
                {/* Card Header — original violet gradient, search + Add button */}
                <CardHeader className="pb-3 bg-gradient-to-r from-violet-500 to-red-500 text-white rounded-t-lg">
                  <div className="mt-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                      <Input
                        placeholder="Search inquiries..."
                        value={globalFilter || ""}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-9 pr-3 py-2 w-full bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:border-white/50 transition-all duration-200"
                      />
                    </div>
                  </div>
                </CardHeader>

                {/* ── NEW TABLE DESIGN FROM PAGE 2 ── */}
                <CardContent className="bg-white p-0">
                  {/* Table Controls */}
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between px-5 py-4 border-b border-gray-100">
                    <p className="text-sm text-gray-600 font-medium">
                      Showing{" "}
                      <span className="font-semibold text-gray-800">
                        {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, totalItems)}
                      </span>{" "}
                      of <span className="font-semibold text-gray-800">{totalItems}</span> inquiries
                    </p>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-gray-600 whitespace-nowrap">Items per page:</Label>
                      <Select value={itemsPerPage === -1 ? "all" : itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                        <SelectTrigger className="w-24 h-9 border-gray-200 focus:border-violet-400 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="all">All</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="bg-gradient-to-r from-violet-100 to-red-100 border-b border-violet-200">
                          {table.getHeaderGroups().map((headerGroup) =>
                            headerGroup.headers.map((header) => (
                              <th key={header.id} className="text-left px-4 py-3 text-sm font-semibold text-gray-700 tracking-wide">
                                {header.isPlaceholder
                                  ? null
                                  : typeof header.column.columnDef.header === "function"
                                    ? header.column.columnDef.header(header.getContext())
                                    : header.column.columnDef.header}
                              </th>
                            )),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedRows.length === 0 ? (
                          <tr>
                            <td colSpan={columns.length} className="px-4 py-16 text-center">
                              <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center">
                                  <Package className="w-8 h-8 text-violet-300" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-700">No inquiries found</p>
                                  {globalFilter && <p className="text-sm text-gray-400 mt-0.5">No results for &quot;{globalFilter}&quot;</p>}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          paginatedRows.map((row, index) => (
                            <tr
                              key={row.id}
                              className={`border-b border-violet-100 hover:bg-gradient-to-r hover:from-violet-50 hover:to-red-50 transition-all duration-200 ${index % 2 === 0 ? "bg-white" : "bg-violet-50/30"}`}
                            >
                              {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="px-4 py-3.5 text-sm align-middle">
                                  {typeof cell.column.columnDef.cell === "function"
                                    ? cell.column.columnDef.cell(cell.getContext())
                                    : (cell.getValue() as React.ReactNode)}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                      <p className="text-sm text-gray-500">
                        Page <span className="font-semibold text-gray-700">{currentPage}</span> of{" "}
                        <span className="font-semibold text-gray-700">{totalPages}</span>
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:text-violet-600 hover:border hover:border-violet-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-semibold"
                        >
                          «
                        </button>
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:text-violet-600 hover:border hover:border-violet-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let page: number
                          if (totalPages <= 5) page = i + 1
                          else if (currentPage <= 3) page = i + 1
                          else if (currentPage >= totalPages - 2) page = totalPages - 4 + i
                          else page = currentPage - 2 + i
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition-all ${
                                currentPage === page
                                  ? "bg-gradient-to-r from-violet-500 to-red-500 text-white shadow-md shadow-violet-200"
                                  : "text-gray-600 hover:bg-white hover:text-violet-600 hover:border hover:border-violet-200"
                              }`}
                            >
                              {page}
                            </button>
                          )
                        })}
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:text-violet-600 hover:border hover:border-violet-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:text-violet-600 hover:border hover:border-violet-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-semibold"
                        >
                          »
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>

        {/* view dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 sm:p-8">
            <DialogHeader className="text-center sm:text-left">
              <DialogTitle className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-violet-600">
                Contact Details
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-gray-500 dark:text-gray-400">Quick overview of the selected contact.</DialogDescription>
            </DialogHeader>

            {selectedContact && (
              <div className="mt-6 space-y-4 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="font-semibold text-violet-600">Name:</span>
                  <span className="break-words">{selectedContact.name}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="font-semibold text-violet-600">Email:</span>
                  <span className="break-words">{selectedContact.email}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="font-semibold text-violet-600">Phone:</span>
                  <span>{selectedContact.phone || "-"}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-violet-600">Message:</span>
                  <p className="p-3 bg-violet-50 dark:bg-violet-900 rounded-lg text-gray-800 dark:text-gray-200 text-sm sm:text-base max-h-40 overflow-auto">
                    {selectedContact.message || "-"}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="font-semibold text-violet-600">Created At:</span>
                  <span>{new Date(selectedContact.created_at).toLocaleString()}</span>
                </div>
              </div>
            )}

            <DialogFooter className="mt-6 flex justify-center sm:justify-end">
              <Button
                variant="outline"
                className="bg-white dark:bg-gray-800 border-violet-400 text-violet-600 hover:bg-violet-50 hover:text-violet-700 transition-all"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  )
}
