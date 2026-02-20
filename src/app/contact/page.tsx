"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import OppaLoader from "@/components/oppa-loader"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePhoneChange = (value: string) => {
    const numbersOnly = value.replace(/\D/g, "").slice(0, 11)
    setFormData((prev) => ({ ...prev, phone: numbersOnly }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (formData.phone && formData.phone.length !== 11) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number must be exactly 11 digits.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Message Sent!",
          description: data.message || "Thank you for contacting us. We'll respond within 24 hours.",
          action: <CheckCircle className="h-5 w-5 text-green-500" />,
        })

        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send message.",
          variant: "destructive",
          action: <AlertCircle className="h-5 w-5 text-red-500" />,
        })
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to send message. Please try again.",
        variant: "destructive",
        action: <AlertCircle className="h-5 w-5 text-red-500" />,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
    <div className="min-h-screen bg-purple-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* HERO */}
        <div className="text-center my-6">
          <h1 className="text-4xl md:text-6xl font-bold text-purple-950 mb-4 drop-shadow-lg">Contact Us</h1>
          <p className="text-purple-800 text-lg">
            Have questions about our tumblers, customization, or orders? <br />We&apos;d love to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* INFO */}
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-purple-200 border-purple-500">
                <CardContent className="p-6 text-center">
                  <MapPin className="w-8 h-8 text-purple-700 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2 text-purple-900">Showroom / Pickup</h3>
                  <p className="text-sm text-purple-700">Pasig City, Philippines</p>
                </CardContent>
              </Card>

              <Card className="bg-purple-200 border-purple-500">
                <CardContent className="p-6 text-center">
                  <Phone className="w-8 h-8 text-purple-700 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2 text-purple-900">Call Us</h3>
                  <p className="text-sm text-purple-700">0912 345 6789</p>
                </CardContent>
              </Card>

              <Card className="bg-purple-200 border-purple-500">
                <CardContent className="p-6 text-center">
                  <Mail className="w-8 h-8 text-purple-700 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2 text-purple-900">Email</h3>
                  <p className="text-sm text-purple-700">support@yourbrand.com</p>
                </CardContent>
              </Card>

              <Card className="bg-purple-200 border-purple-500">
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-purple-700 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2 text-purple-900">Hours</h3>
                  <p className="text-sm text-purple-700">Mon-Sat • 9AM-6PM</p>
                </CardContent>
              </Card>
            </div>

            {/* BUSINESS INFO */}
            <Card className="bg-purple-200 border-purple-500/40">
              <CardHeader>
                <CardTitle className="text-xl text-purple-900">Custom Orders & Bulk Requests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-purple-800">
                <p>Create personalized tumblers for gifts, teams, or branding.</p>
                <p>Bulk & corporate orders available for giveaways and events.</p>
                <p>Nationwide shipping and pickup options supported.</p>
              </CardContent>
            </Card>
          </div>

          {/* FORM */}
          <Card className="bg-purple-200 border-purple-500/40">
            <CardHeader>
              <CardTitle className="text-xl text-purple-900">Send Us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-purple-800">Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="border-purple-400 bg-white/5 text-purple-800 placeholder:text-purple-600"
                    required
                  />
                </div>

                <div>
                  <Label className="text-purple-800">Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="border-purple-400 bg-white/5 text-purple-800 placeholder:text-purple-600"
                    required
                  />
                </div>

                <div>
                  <Label className="text-purple-800">Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="border-purple-400 bg-white/5 text-purple-800 placeholder:text-purple-600"
                    maxLength={11}
                  />
                </div>

                <div>
                  <Label className="text-purple-800">Subject</Label>
                  <Select value={formData.subject} onValueChange={(v) => handleInputChange("subject", v)}>
                    <SelectTrigger className="border-purple-400 bg-white/5 text-purple-800 placeholder:text-purple-600">
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="orders">Orders & Shipping</SelectItem>
                      <SelectItem value="custom">Customization Request</SelectItem>
                      <SelectItem value="bulk">Bulk / Corporate Order</SelectItem>
                      <SelectItem value="product">Product Questions</SelectItem>
                      <SelectItem value="support">Customer Support</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-purple-800">Message</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    className="border-purple-400 bg-white/5 text-purple-800 placeholder:text-purple-600"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div >
  )
}
