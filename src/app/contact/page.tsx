"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

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
    // Only allow numbers and limit to 11 digits
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

    // Validate phone number if provided
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Message Sent!",
          description: data.message || "Thank you for contacting us. We'll get back to you within 24 hours.",
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
          description: data.message || "Failed to send message. Please try again.",
          variant: "destructive",
          action: <AlertCircle className="h-5 w-5 text-red-500" />,
        })
      }
    } catch (error) {
      console.error("Contact form error:", error)
      toast({
        title: "Connection Error",
        description: "Unable to send message. Please check your connection and try again.",
        variant: "destructive",
        action: <AlertCircle className="h-5 w-5 text-red-500" />,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-black via-orange-900 to-yellow-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-yellow-400 rounded-full"></div>
        <div className="absolute top-32 right-20 w-24 h-24 border-2 border-orange-400 rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-yellow-400 rounded-full"></div>
        <div className="absolute bottom-32 right-10 w-28 h-28 border-2 border-orange-400 rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-yellow-300">
            {" "}
            <span className="text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text">Contact</span> Us
          </h1>
          <p className="text-xl text-yellow-200/80 max-w-2xl mx-auto leading-relaxed">
            Have questions about our menu or want to make a reservation? We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="group hover:shadow-lg transition-all duration-300 bg-black/50 backdrop-blur-sm border-orange-600/50 hover:border-orange-400">
                <CardContent className="p-6 text-center">
                  <MapPin className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2 text-yellow-300">Visit Us</h3>
                  <a
                    href="https://maps.app.goo.gl/5NYrsNXawKobjQCf9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-yellow-200/80 hover:text-yellow-300 hover:underline transition-colors"
                  >
                    1st Floor, PISO PAY.COM BLDG, #47 Polaris St, Bel-Air, Makati City
                  </a>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 bg-black/50 backdrop-blur-sm border-orange-600/50 hover:border-orange-400">
                <CardContent className="p-6 text-center">
                  <Phone className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2 text-yellow-300">Call Us</h3>
                  <a href="tel:+6283620676" className="text-sm text-yellow-200/80 hover:text-yellow-300 hover:underline transition-colors">
                    (02) 8362 0676
                  </a>
                  <p className="text-sm text-yellow-200/80 mt-1">Available daily</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 bg-black/50 backdrop-blur-sm border-orange-600/50 hover:border-orange-400">
                <CardContent className="p-6 text-center">
                  <Mail className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2 text-yellow-300">Email Us</h3>
                  <a
                    href="mailto:ph.toriichizu01@gmail.com"
                    className="text-sm text-yellow-200/80 hover:text-yellow-300 hover:underline transition-colors block"
                  >
                    ph.toriichizu01@gmail.com
                  </a>
                  <p className="text-sm text-yellow-200/80 mt-1">We respond within 24hrs</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 bg-black/50 backdrop-blur-sm border-orange-600/50 hover:border-orange-400">
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2 text-yellow-300">Hours</h3>
                  <p className="text-sm text-yellow-200/80">
                    Monday-Thursday: 11AM-2AM
                    <br />
                    Friday-Sunday: 11AM-4AM
                    <br />
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-orange-600/20 via-yellow-600/20 to-orange-600/20 backdrop-blur-sm border-orange-600/50">
              <CardHeader>
                <CardTitle className="text-xl text-yellow-300">Reservations & Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-yellow-400 mb-2">Table Reservations</h4>
                  <p className="text-sm text-yellow-200/80">
                    For parties of 6 or more, we recommend making a reservation. Call us at{" "}
                    <a href="tel:+6283620676" className="text-orange-400 hover:text-orange-300 hover:underline transition-colors">
                      (02) 8362 0676
                    </a>{" "}
                    or use our online booking system.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-400 mb-2">Private Events</h4>
                  <p className="text-sm text-yellow-200/80">
                    We cater private events and parties! Contact us at{" "}
                    <a href="mailto:ph.toriichizu01@gmail.com" className="text-yellow-400 hover:text-yellow-300 hover:underline transition-colors">
                      ph.toriichizu01@gmail.com
                    </a>{" "}
                    for custom menu options and pricing for your special occasion.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-400 mb-2">Delivery & Takeout</h4>
                  <p className="text-sm text-yellow-200/80">
                    Order online for delivery or pickup. Delivery available within a 5-mile radius with a ₱500.00 minimum order.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-black/50 backdrop-blur-sm border-orange-600/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-yellow-300">Send Us a Message</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-yellow-200">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Your name"
                    required
                    className="border-orange-600/50 bg-black/50 text-yellow-100 placeholder:text-yellow-700 focus:border-orange-400 focus:ring-orange-400/20 h-12 text-base"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-yellow-200">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="border-orange-600/50 bg-black/50 text-yellow-100 placeholder:text-yellow-700 focus:border-orange-400 focus:ring-orange-400/20 h-12 text-base"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-yellow-200">
                    Phone (Optional)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="09XXXXXXXXX (11 digits)"
                    className="border-orange-600/50 bg-black/50 text-yellow-100 placeholder:text-yellow-700 focus:border-orange-400 focus:ring-orange-400/20 h-12 text-base"
                    disabled={isSubmitting}
                    maxLength={11}
                  />
                  {formData.phone && formData.phone.length > 0 && formData.phone.length !== 11 && (
                    <p className="text-xs text-red-400 mt-1">Must be exactly 11 digits</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="subject" className="text-yellow-200">
                    Subject
                  </Label>
                  <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)} disabled={isSubmitting}>
                    <SelectTrigger className="border-orange-600/50 bg-black/50 text-yellow-100 focus:border-orange-400 focus:ring-orange-400/20 h-12 text-base">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 border-orange-600/50">
                      <SelectItem value="orders" className="text-yellow-100 focus:bg-orange-600/30 focus:text-yellow-100">
                        Online Orders & Delivery
                      </SelectItem>
                      <SelectItem value="payment" className="text-yellow-100 focus:bg-orange-600/30 focus:text-yellow-100">
                        Payment & Promotions
                      </SelectItem>
                      <SelectItem value="customer-service" className="text-yellow-100 focus:bg-orange-600/30 focus:text-yellow-100">
                        Customer Service
                      </SelectItem>
                      <SelectItem value="technical" className="text-yellow-100 focus:bg-orange-600/30 focus:text-yellow-100">
                        Website & Technical Support
                      </SelectItem>
                      <SelectItem value="careers" className="text-yellow-100 focus:bg-orange-600/30 focus:text-yellow-100">
                        Careers & Partnerships
                      </SelectItem>
                      <SelectItem value="others" className="text-yellow-100 focus:bg-orange-600/30 focus:text-yellow-100">
                        Others
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message" className="text-yellow-200">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    placeholder="Tell us how we can help you..."
                    rows={6}
                    required
                    className="border-orange-600/50 bg-black/50 text-yellow-100 placeholder:text-yellow-700 focus:border-orange-400 focus:ring-orange-400/20 resize-none text-base min-h-[200px]"
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold py-3 h-12 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      Sending...
                    </span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-12 bg-black/50 backdrop-blur-sm border-orange-600/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-yellow-300 text-center">Find Us</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-orange-600/50">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.645583101857!2d121.02661837681514!3d14.562248885919582!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c9004b934477%3A0x94f3274e9f6fd6c!2sIzakaya%20Tori-Ichizu!5e0!3m2!1sen!2sph!4v1761286308658!5m2!1sen!2sph"
                width="1455"
                height="550"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
