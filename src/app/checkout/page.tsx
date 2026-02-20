"use client"

import type React from "react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/store/cartStore"
import type { CheckoutInfo } from "@/types"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Banknote, Lock, Package, LogIn, Upload, X, Copy, Check } from "lucide-react"
import Link from "next/link"

interface ExtendedCheckoutInfo extends Omit<CheckoutInfo, "paymentMethod"> {
  paymentMethod: "cash" | "gcash" | "security_bank"
  notes?: string
}

interface Address {
  id: number
  street: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}

const formatPrice = (price: number): string => {
  return price.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const Checkout = () => {
  const { items, getTotal, clearCart } = useCartStore()
  const total = getTotal()
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const [isOrderComplete, setIsOrderComplete] = useState(false)
  const [userInfo, setUserInfo] = useState<any | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [copiedGcash, setCopiedGcash] = useState(false)
  const [copiedBank, setCopiedBank] = useState(false)

  const [checkoutInfo, setCheckoutInfo] = useState<ExtendedCheckoutInfo>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    paymentMethod: "cash",
    notes: "",
  })

  const [receiptFile, setReceiptFile] = useState<string | null>(null)
  const user = localStorage.getItem("user_data")
  const token = localStorage.getItem("auth_token")


  useEffect(() => {
    const checkAuthAndFillForm = async () => {
      const storedUser = localStorage.getItem("user_data")
      const storedToken = localStorage.getItem("auth_token")


      if (storedToken && storedUser) {
        try {
          const parsedUserInfo = await JSON.parse(storedUser)
          setUserInfo(parsedUserInfo)

          const addressesResponse = await fetch("/api/orders?page=1&per_page=1", {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          })

          const response = await fetch("/api/orders?page=1&per_page=1", {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          })
          console.log("orders response", response)
          if (response.ok) {
            const parsedUserData = JSON.parse(storedUser)
            setUserInfo(parsedUserData)

            const addressesResponse = await fetch("/api/addresses", {
              headers: {
                Authorization: `Bearer ${storedToken}`,
              },
            })

            if (addressesResponse.ok) {
              const addressesData = await addressesResponse.json()
              const addresses: Address[] = addressesData.addresses || []

              const defaultAddress = addresses.find((addr) => addr.is_default)

              if (defaultAddress) {
                setCheckoutInfo((prev) => ({
                  ...prev,
                  name: parsedUserData.name || "",
                  email: parsedUserData.email || "",
                  phone: parsedUserData.phone || "",
                  address: defaultAddress.street,
                  city: defaultAddress.city,
                  zipCode: defaultAddress.postal_code,
                }))

                toast({
                  title: "Welcome back!",
                  description: "Your default address has been loaded.",
                })
              } else {
                setCheckoutInfo((prev) => ({
                  ...prev,
                  name: parsedUserData.name || "",
                  email: parsedUserData.email || "",
                  phone: parsedUserData.phone || "",
                  address: parsedUserData.address || "",
                  city: parsedUserData.city || "",
                  zipCode: parsedUserData.zip_code || "",
                }))

                toast({
                  title: "Welcome back!",
                  description: "Your information has been automatically filled.",
                })
              }
            } else {
              setCheckoutInfo((prev) => ({
                ...prev,
                name: parsedUserData.name || "",
                email: parsedUserData.email || "",
                phone: parsedUserData.phone || "",
                address: parsedUserData.address || "",
                city: parsedUserData.city || "",
                zipCode: parsedUserData.zip_code || "",
              }))

              toast({
                title: "Welcome back!",
                description: "Your information has been automatically filled.",
              })
            }
          } else {
            localStorage.removeItem("auth_token")
            localStorage.removeItem("user_data")
          }
        } catch (error) {
          console.error("Error checking auth:", error)
          localStorage.removeItem("auth_token")
          localStorage.removeItem("user_data")
        }
      }
      setIsLoadingUser(false)
    }

    checkAuthAndFillForm()
  }, [])

  // Auto-switch payment method if total exceeds 1000 and cash is selected
  useEffect(() => {
    if (total > 1000 && checkoutInfo.paymentMethod === "cash") {
      setCheckoutInfo((prev) => ({ ...prev, paymentMethod: "gcash" }))
      toast({
        title: "Payment Method Changed",
        description: "Cash on Delivery is not available for orders above ₱1,000. Switched to GCash.",
        variant: "destructive",
      })
    }
  }, [total, checkoutInfo.paymentMethod])

  const handleInputChange = (field: keyof ExtendedCheckoutInfo, value: string) => {
    setCheckoutInfo((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Enforce 2MB limit for receipt uploads
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 2MB",
          variant: "destructive",
        })
        // Clear the file input
        e.target.value = ''
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setReceiptFile(reader.result as string)
        toast({
          title: "Receipt uploaded",
          description: "Your payment receipt has been attached",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeReceipt = () => {
    setReceiptFile(null)
    toast({
      title: "Receipt removed",
      description: "Payment receipt has been removed",
    })
  }

  const copyToClipboard = (text: string, type: 'gcash' | 'bank') => {
    navigator.clipboard.writeText(text)
    if (type === 'gcash') {
      setCopiedGcash(true)
      setTimeout(() => setCopiedGcash(false), 2000)
      toast({
        title: "Copied!",
        description: "GCash number copied to clipboard",
      })
    } else {
      setCopiedBank(true)
      setTimeout(() => setCopiedBank(false), 2000)
      toast({
        title: "Copied!",
        description: "Bank account number copied to clipboard",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!checkoutInfo.name || !checkoutInfo.email || !checkoutInfo.phone || !checkoutInfo.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if ((checkoutInfo.paymentMethod === "gcash" || checkoutInfo.paymentMethod === "security_bank") && !receiptFile) {
      toast({
        title: "Receipt Required",
        description: "Please upload your payment receipt to proceed.",
        variant: "destructive",
      })
      return
    }

    console.log("Token in   localStorage:", localStorage.getItem("auth_token"))

    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description || "",
      price: item.price,
      quantity: item.quantity,
      image: typeof item.image === "string" ? item.image : 'placeholder.svg',
    })),

      // if (!token) {
      //   toast({
      //     title: "Authentication Required",
      //     description: "Please log in to place an order.",
      //     variant: "destructive",
      //   })
      //   router.push("/login")
      //   return
      // }

      setIsProcessing(true)

    try {
      const orderData = {
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description || "",
          price: item.price,
          quantity: item.quantity,
          image: typeof item.image === "string" ? item.image : 'placeholder.svg',
        })),
        payment_method: checkoutInfo.paymentMethod,
        delivery_address: checkoutInfo.address,
        delivery_city: checkoutInfo.city,
        delivery_zip_code: checkoutInfo.zipCode,
        customer_name: checkoutInfo.name,
        customer_email: checkoutInfo.email,
        customer_phone: checkoutInfo.phone,
        notes: checkoutInfo.notes || "",
        receipt_file: receiptFile || null,
      }
      console.log("orderData", orderData)
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      // Log response for debugging
      console.log("API Response:", result)
      console.log("Response Status:", response.status)

      // Handle different response formats
      if (response.ok) {
        // Check multiple possible success formats
        const orderNumber =
          result.data?.order?.order_number ||
          result.data?.order_number ||
          result.order?.order_number ||
          result.order_number ||
          "your order"

        clearCart()
        setIsOrderComplete(true)

        toast({
          title: "Order Placed Successfully!",
          description: `Order ${orderNumber} has been created.`,
        })

        setTimeout(() => {
          router.push("/orders")
        }, 1000)
      } else {
        throw new Error(result.message || result.error || "Failed to create order")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Failed to place order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0 && !isOrderComplete) {
    router.push("/cart")
    return null
  }

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-purple-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">Loading checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-purple-50">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-purple-50 to-amber-50">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-100/20 to-amber-200/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple-100/15 to-amber-200/10 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-100/10 to-amber-200/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-purple-100/15 to-amber-200/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Checkout</h1>
            {userInfo && (
              <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 border border-purple-200 shadow-md">
                <LogIn className="w-4 h-4 text-purple-600" />
                <span className="text-gray-700 font-medium">Welcome, {userInfo.name}!</span>
              </div>
            )}
          </div>

          {!userInfo && (
            <Card className="mb-8 bg-white/95 backdrop-blur-sm border-purple-200 rounded-2xl shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Login for faster checkout!</h3>
                    <p className="text-gray-600">Save your information for quick ordering next time.</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/login">
                      <Button variant="outline" className="border-purple-300 text-gray-700 hover:bg-purple-50 bg-white">
                        <LogIn className="w-4 h-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md">
                        <LogIn className="w-4 h-4 mr-2" />
                        Register
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/98 backdrop-blur-md border-purple-200 shadow-lg rounded-2xl overflow-hidden p-0">
              <div className="border-b border-purple-200 bg-purple-600 text-white px-6 py-4">
                <h2 className="text-xl font-semibold">Delivery & Payment Information</h2>
              </div>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900 border-b border-purple-200 pb-2">
                      Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-gray-700">
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          value={checkoutInfo.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Enter your full name"
                          required
                          className="bg-white border-purple-300 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-gray-700">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={checkoutInfo.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="Enter your email"
                          required
                          className="bg-white border-purple-300 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-gray-700">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={checkoutInfo.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="Enter your phone number"
                        required
                        className="bg-white border-purple-300 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                      />
                    </div>
                  </div>

                  <Separator className="bg-purple-200" />

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900 border-b border-purple-200 pb-2">
                      Delivery Address
                    </h3>

                    <div>
                      <Label htmlFor="address" className="text-gray-700">
                        Street Address *
                      </Label>
                      <Input
                        id="address"
                        value={checkoutInfo.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Enter your street address"
                        required
                        className="bg-white border-purple-300 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-gray-700">
                          City *
                        </Label>
                        <Input
                          id="city"
                          value={checkoutInfo.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          placeholder="Enter your city"
                          required
                          className="bg-white border-purple-300 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode" className="text-gray-700">
                          ZIP Code *
                        </Label>
                        <Input
                          id="zipCode"
                          value={checkoutInfo.zipCode}
                          onChange={(e) => handleInputChange("zipCode", e.target.value)}
                          placeholder="Enter ZIP code"
                          required
                          className="bg-white border-purple-300 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-purple-200" />

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900 border-b border-purple-200 pb-2">
                      Payment Method
                    </h3>

                    {total > 1000 && (
                      <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg mb-3">
                        <p className="text-sm text-amber-800 font-medium">
                          ⚠️ Cash on Delivery is not available for orders above ₱1,000. Please use GCash or Bank Transfer.
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div
                        className={`p-4 rounded-lg border-2 transition-all ${total > 1000
                            ? "bg-gray-100 border-gray-300 cursor-not-allowed opacity-60"
                            : checkoutInfo.paymentMethod === "cash"
                              ? "bg-purple-50 border-purple-500 cursor-pointer"
                              : "bg-white border-purple-200 hover:border-purple-300 cursor-pointer"
                          }`}
                        onClick={() => {
                          if (total <= 1000) {
                            handleInputChange("paymentMethod", "cash")
                          }
                        }}
                      >
                        <div className="flex items-center gap-2 text-gray-700">
                          <Banknote className="w-5 h-5" />
                          <span className="font-medium">Cash on Delivery</span>
                          {total > 1000 && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold ml-auto">
                              Not Available
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {total > 1000
                            ? "Only available for orders ₱1,000 and below"
                            : "Pay with cash when your order arrives"}
                        </p>
                      </div>

                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${checkoutInfo.paymentMethod === "gcash"
                            ? "bg-purple-50 border-purple-500"
                            : "bg-white border-purple-200 hover:border-purple-300"
                          }`}
                        onClick={() => handleInputChange("paymentMethod", "gcash")}
                      >
                        <div className="flex items-center gap-2 text-gray-700">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.72-2.77-.01-2.2-1.9-2.96-3.65-3.42z" />
                          </svg>
                          <span className="font-medium">GCash QR</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Scan QR code to pay via GCash</p>
                      </div>

                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${checkoutInfo.paymentMethod === "security_bank"
                            ? "bg-purple-50 border-purple-500"
                            : "bg-white border-purple-200 hover:border-purple-300"
                          }`}
                        onClick={() => handleInputChange("paymentMethod", "security_bank")}
                      >
                        <div className="flex items-center gap-2 text-gray-700">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                          </svg>
                          <span className="font-medium">Security Bank</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Bank transfer via Security Bank</p>
                      </div>
                    </div>

                    {checkoutInfo.paymentMethod === "gcash" && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2 mb-3">
                          <svg
                            className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div className="flex-1">
                            <h4 className="font-semibold text-blue-900 mb-3">GCash Payment Instructions</h4>

                            {/* GCash QR Code */}
                            <div className="bg-white p-4 rounded-lg border border-blue-200 mb-3 flex justify-center">
                              <Image
                                src="/gcash_qr.png"
                                alt="GCash QR Code"
                                className="w-48 h-48 object-contain"
                              />
                            </div>

                            {/* GCash Number */}
                            <div className="bg-white p-3 rounded-lg border border-blue-200 mb-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">GCash Number</p>
                                  <p className="text-lg font-bold text-gray-900">09456754591</p>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard("09456754591", "gcash")}
                                  className="border-blue-300 hover:bg-blue-50"
                                >
                                  {copiedGcash ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2 text-sm text-blue-800">
                              <p>1. Scan the QR code or send to 09456754591</p>
                              <p>2. Complete the payment for ₱{formatPrice(total)}</p>
                              <p>3. Upload your payment receipt below</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <Label htmlFor="receipt" className="text-gray-700 mb-2 block">
                            Upload Payment Receipt *
                          </Label>
                          {!receiptFile ? (
                            <div className="relative">
                              <input
                                type="file"
                                id="receipt"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                              <label
                                htmlFor="receipt"
                                className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all"
                              >
                                <Upload className="w-5 h-5 text-gray-600" />
                                <span className="text-gray-700">Click to upload receipt</span>
                              </label>
                            </div>
                          ) : (
                            <div className="relative p-4 border-2 border-green-300 rounded-lg bg-green-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <svg
                                    className="w-5 h-5 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <span className="text-green-800 font-medium">Receipt uploaded</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={removeReceipt}
                                  className="text-red-600 hover:text-red-800 transition-colors"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                              <Image
                                src={receiptFile}
                                alt="Receipt"
                                className="mt-3 max-h-40 rounded-lg border border-gray-300"
                              />
                            </div>
                          )}
                          <p className="text-xs text-gray-600 mt-1">Max file size: 2MB (JPG, PNG)</p>
                        </div>
                      </div>
                    )}

                    {checkoutInfo.paymentMethod === "security_bank" && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2 mb-3">
                          <svg
                            className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div className="flex-1">
                            <h4 className="font-semibold text-blue-900 mb-3">Security Bank Payment Instructions</h4>

                            {/* Bank Account Details */}
                            <div className="bg-white p-4 rounded-lg border border-blue-200 mb-3">
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Bank Name</p>
                                  <p className="text-base font-semibold text-gray-900">Security Bank</p>
                                </div>
                                <Separator className="bg-gray-200" />
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-600 mb-1">Account Number</p>
                                    <p className="text-lg font-bold text-gray-900">0000075486863</p>
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard("0000075486863", "bank")}
                                    className="border-blue-300 hover:bg-blue-50"
                                  >
                                    {copiedBank ? (
                                      <Check className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 text-sm text-blue-800">
                              <p>1. Transfer to Security Bank account: 0000075486863</p>
                              <p>2. Complete the payment for ₱{formatPrice(total)}</p>
                              <p>3. Upload your payment receipt below</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <Label htmlFor="receipt" className="text-gray-700 mb-2 block">
                            Upload Payment Receipt *
                          </Label>
                          {!receiptFile ? (
                            <div className="relative">
                              <input
                                type="file"
                                id="receipt"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                              <label
                                htmlFor="receipt"
                                className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all"
                              >
                                <Upload className="w-5 h-5 text-gray-600" />
                                <span className="text-gray-700">Click to upload receipt</span>
                              </label>
                            </div>
                          ) : (
                            <div className="relative p-4 border-2 border-green-300 rounded-lg bg-green-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <svg
                                    className="w-5 h-5 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <span className="text-green-800 font-medium">Receipt uploaded</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={removeReceipt}
                                  className="text-red-600 hover:text-red-800 transition-colors"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                              <Image
                                src={receiptFile}
                                alt="Receipt"
                                width={100}
                                height={100}
                                className="mt-3 max-h-40 rounded-lg border border-gray-300"
                              />
                            </div>
                          )}
                          <p className="text-xs text-gray-600 mt-1">Max file size: 2MB (JPG, PNG)</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-purple-200" />

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900 border-b border-purple-200 pb-2">
                      Additional Notes
                    </h3>
                    <div>
                      <Label htmlFor="notes" className="text-gray-700">
                        Special Instructions (Optional)
                      </Label>
                      <Input
                        id="notes"
                        value={checkoutInfo.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        placeholder="Any special requests or delivery instructions..."
                        className="bg-white border-purple-300 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing Order...
                      </span>
                    ) : (
                      `Place Order - ₱${formatPrice(total)}`
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="h-fit bg-white/98 backdrop-blur-md border-purple-200 shadow-lg rounded-2xl sticky top-24 overflow-hidden p-0">
              <div className="border-b border-purple-200 bg-purple-600 text-white px-6 py-4">
                <h2 className="text-xl font-semibold">Order Summary</h2>
              </div>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-3">
                  {items.map((item) => {
                    const itemPrice = Number(item.price) || 0
                    const itemTotal = itemPrice * item.quantity

                    return (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-3 rounded-lg bg-purple-50 border border-purple-200"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-600">
                            Qty: {item.quantity} × ₱{formatPrice(itemPrice)}
                          </div>
                        </div>
                        <div className="font-medium text-gray-900">₱{formatPrice(itemTotal)}</div>
                      </div>
                    )
                  })}
                </div>

                <Separator className="bg-purple-200" />

                <div className="space-y-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">₱{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="text-xs text-center pt-4 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Lock className="w-4 h-4" /> <span>Your payment information is secure</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Package className="w-4 h-4" /> <span>Estimated delivery: 30-45 minutes</span>
                  </div>
                  <div className="text-gray-700 font-medium">Thank you for your order! 🍱</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
