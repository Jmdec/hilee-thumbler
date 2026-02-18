"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Plus, Edit, Trash2, Check, MapPin, Mail, Phone, User } from "lucide-react"
import { AddAddressModal, type AddressFormData } from "@/components/add-address-modal"
import { toast } from "@/hooks/use-toast"
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

interface Address {
  id: number
  street: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}

interface User {
  id: string | number
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  zip_code?: string
  token: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingData, setEditingData] = useState<AddressFormData | undefined>()
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null)

  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem("user_data")
        const storedToken = localStorage.getItem("auth_token")

        if (!storedUser || !storedToken) {
          router.push("/login")
          return
        }

        const parsedUser = JSON.parse(storedUser)
        setUser({ ...parsedUser, token: storedToken })
        fetchAddresses(storedToken)
      } catch (error) {
        console.error("Error loading user:", error)
        router.push("/login")
      }
    }

    loadUserData()
  }, [router])

  const fetchAddresses = async (token: string) => {
    try {
      setLoading(true)
      const response = await fetch("/api/addresses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch addresses")
      }

      const data = await response.json()
      setAddresses(data.addresses || [])
    } catch (error) {
      console.error("Error fetching addresses:", error)
      toast({
        title: "Error",
        description: "Failed to load addresses. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddAddress = async (formData: AddressFormData) => {
    if (!user?.token) return

    try {
      const url = editingId ? `/api/addresses/${editingId}` : "/api/addresses"
      const method = editingId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${editingId ? "update" : "add"} address`)
      }

      const data = await response.json()
      const newAddress = data.data || data.address

      if (editingId) {
        setAddresses(addresses.map((addr) => (addr.id === editingId ? newAddress : addr)))
        setEditingId(null)
        toast({
          title: "Success",
          description: "Address updated successfully.",
        })
      } else {
        setAddresses([...addresses, newAddress])
        toast({
          title: "Success",
          description: "Address added successfully.",
        })
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to save address. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAddress = async (id: number) => {
    if (!user?.token) return

    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete address")
      }

      setAddresses(addresses.filter((addr) => addr.id !== id))
      toast({
        title: "Success",
        description: "Address deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting address:", error)
      toast({
        title: "Error",
        description: "Failed to delete address. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setAddressToDelete(null)
    }
  }

  const confirmDelete = (id: number) => {
    setAddressToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleSetDefault = async (id: number) => {
    if (!user?.token) return

    try {
      const response = await fetch(`/api/addresses/${id}/set-default`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to set default address")
      }

      setAddresses(
        addresses.map((addr) => ({
          ...addr,
          is_default: addr.id === id,
        })),
      )
      toast({
        title: "Success",
        description: "Default address updated successfully.",
      })
    } catch (error) {
      console.error("Error setting default address:", error)
      toast({
        title: "Error",
        description: "Failed to set default address. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditClick = async (address: Address) => {
    if (!user?.token) return

    setIsLoadingAddress(true)
    
    // Re-fetch all addresses to ensure we have the latest data
    try {
      const response = await fetch("/api/addresses", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch addresses")
      }

      const data = await response.json()
      const updatedAddresses = data.addresses || []
      setAddresses(updatedAddresses)

      // Find the current address from the fresh data
      const currentAddress = updatedAddresses.find((addr: Address) => addr.id === address.id)

      if (!currentAddress) {
        throw new Error("Address not found")
      }

      setEditingId(currentAddress.id)
      const formData = {
        street: currentAddress.street,
        city: currentAddress.city,
        state: currentAddress.state,
        postal_code: currentAddress.postal_code,
        country: currentAddress.country,
      }
      setEditingData(formData)
      
      // Small delay to ensure state is set before opening modal
      setTimeout(() => {
        setIsModalOpen(true)
        setIsLoadingAddress(false)
      }, 100)
    } catch (error) {
      console.error("Error fetching address:", error)
      setIsLoadingAddress(false)
      toast({
        title: "Error",
        description: "Failed to load address details. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setEditingData(undefined)
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">Account Settings</h1>
          <p className="text-gray-600 text-center">Manage your personal information and delivery addresses</p>
        </div>

        {/* User Profile Card */}
        <Card className="mb-8 overflow-hidden border-0 shadow-lg">
          {/* Orange gradient header */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-orange-100">Valued Customer</p>
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div className="p-8 bg-white grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 uppercase tracking-wide mb-2">
                <Mail className="h-4 w-4" />
                EMAIL ADDRESS
              </div>
              <p className="text-lg font-semibold text-gray-900">{user.email}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 uppercase tracking-wide mb-2">
                <Phone className="h-4 w-4" />
                PHONE NUMBER
              </div>
              <p className="text-lg font-semibold text-gray-900">{user.phone || "Not provided"}</p>
            </div>
          </div>
        </Card>

        {/* Delivery Addresses Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Delivery Addresses</h2>
                <p className="text-sm text-gray-600">Manage where we deliver your orders</p>
              </div>
            </div>
            {addresses.length < 5 && (
              <Button
                onClick={() => {
                  setEditingId(null)
                  setEditingData(undefined)
                  setIsModalOpen(true)
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white shadow-md w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Address
              </Button>
            )}
          </div>

          {/* Addresses List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading addresses...</p>
            </div>
          ) : addresses.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed border-gray-300 bg-white">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">No addresses yet</p>
              <p className="text-gray-500 text-sm mt-1">Add your first delivery address to get started</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {addresses.map((address, index) => (
                <Card
                  key={address.id}
                  className={`overflow-hidden transition-all ${
                    address.is_default
                      ? "ring-2 ring-orange-500 shadow-lg"
                      : "border border-gray-200 shadow-sm hover:shadow-md"
                  }`}
                >
                  {/* Address Content */}
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-white text-xl font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-base font-bold text-gray-900 break-words leading-tight">
                            {address.street}
                          </h3>
                          {address.is_default && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-semibold rounded-full shadow-sm flex-shrink-0">
                              <Check className="h-3 w-3" />
                              Default
                            </span>
                          )}
                        </div>
                        <div className="space-y-0.5 text-sm text-gray-600">
                          <p>{address.city}, {address.state}</p>
                          <p className="text-gray-500">{address.postal_code}, {address.country}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                      {!address.is_default && (
                        <Button
                          onClick={() => handleSetDefault(address.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1 min-w-[140px] border-orange-300 text-orange-600 hover:bg-orange-50 font-medium"
                        >
                          <Check className="h-4 w-4 mr-1.5" />
                          Set Default
                        </Button>
                      )}
                      <Button
                        onClick={() => handleEditClick(address)}
                        variant="outline"
                        size="sm"
                        className={`${!address.is_default ? 'flex-1 min-w-[100px]' : 'flex-1'} border-gray-300 text-gray-700 hover:bg-gray-50 font-medium`}
                        disabled={isLoadingAddress}
                      >
                        <Edit className="h-4 w-4 mr-1.5" />
                        {isLoadingAddress ? "Loading..." : "Edit"}
                      </Button>
                      <Button
                        onClick={() => confirmDelete(address.id)}
                        variant="outline"
                        size="sm"
                        className={`${!address.is_default ? 'flex-1 min-w-[100px]' : 'flex-1'} border-red-300 text-red-600 hover:bg-red-50 font-medium`}
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Address Modal */}
      <AddAddressModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddAddress}
        isEditing={editingId !== null}
        initialData={editingData}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this delivery address. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => addressToDelete && handleDeleteAddress(addressToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
