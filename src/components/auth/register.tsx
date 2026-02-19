"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Lock, Eye, EyeOff, Phone, MapPin, Building, Hash, UserPlus, CircleChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip_code: "",
    password: "",
    password_confirmation: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    // Phone number validation: only accept numbers
    if (field === "phone") {
      const numbersOnly = value.replace(/\D/g, "")
      setFormData((prev) => ({ ...prev, [field]: numbersOnly }))
      return
    }
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.password || !formData.password_confirmation) {
      toast.error("Missing Information", {
        description: "Please fill in all required fields.",
      })
      return
    }

    if (formData.password !== formData.password_confirmation) {
      toast.error("Password Mismatch", {
        description: "Passwords do not match. Please check and try again.",
      })
      return
    }

    if (formData.password.length < 8) {
      toast.error("Password Too Short", {
        description: "Password must be at least 8 characters long.",
      })
      return
    }

    if (formData.phone && formData.phone.length !== 11) {
      toast.error("Invalid Phone Number", {
        description: "Phone number must be exactly 11 digits.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Registration Successful!", {
          description: "Please check your email to verify your account.",
          duration: 5000,
        })

        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        toast.error("Registration Failed", {
          description: data.message || "Registration failed. Please try again.",
        })
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("Connection Error", {
        description: "Unable to register. Please check your connection and try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-gradient-to-b from-purple-800 via-purple-900 to-purple-800 overflow-y-auto">
        {/* Soft floating blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-300 rounded-full blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-10 left-1/2 w-72 h-72 bg-blue-300 rounded-full blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        <style>{`
        @keyframes blob {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px,-50px) scale(1.1); }
          66% { transform: translate(-20px,20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>

        <div className="min-h-screen flex justify-center px-4 py-8 md:py-12">
          <Card className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl bg-white shadow-2xl border-4 border-purple-400 overflow-hidden !p-0">
            <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-purple-500 rounded-t-lg px-6 py-4 !m-0 p-2">
              <div className="relative flex items-center py-2">
                <Link href="/" className="absolute left-0">
                  <CircleChevronLeft className="w-7 h-7 text-white mx-5" />
                </Link>
                <h2 className="mx-auto text-3xl md:text-4xl text-white font-bold">
                  Register
                </h2>
              </div>
              <p className="text-white/90 mt-2">Get the latest updates and discounts!</p>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-black font-semibold flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-purple-500" />
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="border-2 border-purple-300 bg-white text-black placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-400/30 h-12 text-base"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-black font-semibold flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-purple-500" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="border-2 border-purple-300 bg-white text-black placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-400/30 h-12 text-base"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-black font-semibold flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-purple-500" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="09123456789 (11 digits)"
                    maxLength={11}
                    className="border-2 border-purple-300 bg-white text-black placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-400/30 h-12 text-base"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-black font-semibold flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-purple-500" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Enter your address"
                    className="border-2 border-purple-300 bg-white text-black placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-400/30 h-12 text-base"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-black font-semibold flex items-center gap-2 mb-2">
                      <Building className="w-4 h-4 text-purple-500" />
                      City
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="Enter your city"
                      className="border-2 border-purple-300 bg-white text-black placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-400/30 h-12 text-base"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="zip_code" className="text-black font-semibold flex items-center gap-2 mb-2">
                      <Hash className="w-4 h-4 text-purple-500" />
                      ZIP Code
                    </Label>
                    <Input
                      id="zip_code"
                      value={formData.zip_code}
                      onChange={(e) => handleInputChange("zip_code", e.target.value)}
                      placeholder="12345"
                      className="border-2 border-purple-300 bg-white text-black placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-400/30 h-12 text-base"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password" className="text-black font-semibold flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-purple-500" />
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        placeholder="Enter password (min 8 characters)"
                        required
                        minLength={8}
                        className="border-2 border-purple-300 bg-white text-black placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-400/30 h-12 text-base pr-10"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500 hover:text-purple-700 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="password_confirmation"
                      className="text-black font-semibold flex items-center gap-2 mb-2"
                    >
                      <Lock className="w-4 h-4 text-purple-500" />
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password_confirmation"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.password_confirmation}
                        onChange={(e) => handleInputChange("password_confirmation", e.target.value)}
                        placeholder="Confirm password"
                        required
                        className="border-2 border-purple-300 bg-white text-black placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-400/30 h-12 text-base pr-10"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500 hover:text-purple-700 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-500 hover:from-purple-400 hover:to-purple-400 text-black font-bold py-3 h-14 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      Creating Account...
                    </span>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>

                <div className="text-center pt-4">
                  <p className="text-black/80">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                    >
                      Login here
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </>
  )
}
