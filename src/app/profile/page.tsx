"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Settings, Shield, Globe } from "lucide-react"
import OppaLoader from "@/components/oppa-loader"

export default function AccountSettingsPage() {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Profile and shipping state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [shipping, setShipping] = useState({
    address: "",
    city: "",
    zip_code: "",
  })

  // Password state
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  // Initialize user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user_data")
    if (userData) {
      const parsed = JSON.parse(userData)
      setProfile({
        name: parsed.name || "",
        email: parsed.email || "",
        phone: parsed.phone || "",
      })
      setShipping({
        address: parsed.address || "",
        city: parsed.city || "",
        zip_code: parsed.zip_code || "",
      })
    }
  }, [])

  // Generic save function
  const saveSection = async (section: "profile" | "shipping" | "password", data: any) => {
    setSaving(true)
    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ section, ...data }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Failed to update")

      toast({
        title: `${section.charAt(0).toUpperCase() + section.slice(1)} Saved`,
        description: json.message,
      })

      // Update localStorage for profile/shipping
      if (section !== "password") {
        const updatedUser = { ...JSON.parse(localStorage.getItem("user") || "{}"), ...data }
        localStorage.setItem("user", JSON.stringify(updatedUser))
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong" })
    } finally {
      setSaving(false)
    }
  }

  console.log(profile)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <OppaLoader />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-violet-50 to-violet-50">
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-violet-100">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-violet-600 bg-clip-text text-transparent flex items-center gap-2">
              <Settings className="w-6 h-6 text-violet-600" />
              Account Settings
            </h1>
            <p className="text-gray-600 mt-1">Update your profile, shipping info, and password</p>
          </div>

          {/* Profile Section */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-violet-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={profile.name} onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile.email} disabled />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={profile.phone} onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))} />
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => saveSection("profile", profile)}
                  className="bg-gradient-to-r from-violet-500 to-violet-500 text-white"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Section */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-violet-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Street Address</Label>
                <Input value={shipping.address} onChange={(e) => setShipping((prev) => ({ ...prev, address: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={shipping.city} onChange={(e) => setShipping((prev) => ({ ...prev, city: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Zip Code</Label>
                  <Input value={shipping.zip_code} onChange={(e) => setShipping((prev) => ({ ...prev, zip_code: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => saveSection("shipping", shipping)}
                  className="bg-gradient-to-r from-violet-500 to-violet-500 text-white"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Address"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-violet-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" value={password.current} onChange={(e) => setPassword((prev) => ({ ...prev, current: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value={password.new} onChange={(e) => setPassword((prev) => ({ ...prev, new: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" value={password.confirm} onChange={(e) => setPassword((prev) => ({ ...prev, confirm: e.target.value }))} />
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() =>
                    saveSection("password", {
                      current_password: password.current,
                      new_password: password.new,
                      new_password_confirmation: password.confirm,
                    })
                  }
                  className="bg-gradient-to-r from-violet-500 to-violet-500 text-white"
                  disabled={saving}
                >
                  {saving ? "Updating..." : "Change Password"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
