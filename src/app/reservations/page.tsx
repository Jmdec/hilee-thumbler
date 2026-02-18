"use client"

import { useState, useEffect } from "react"
import {
  ChevronRight,
  Users,
  Calendar,
  Clock,
  Mail,
  Phone,
  User,
  MessageSquare,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

export default function ReservationsPage() {
  const [step, setStep] = useState(1)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "2",
    special_requests: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [emailError, setEmailError] = useState("")
  const [dailyBookingsCount, setDailyBookingsCount] = useState(0)
  const [checkingBookings, setCheckingBookings] = useState(false)

  // Check if user is logged in and pre-fill form
  useEffect(() => {
    const userData = localStorage.getItem("user_data")
    const token = localStorage.getItem("auth_token")
    
    if (!userData || !token) {
      // Redirect to login if not authenticated
      window.location.href = "/login?redirect=/reservations"
      return
    }
    
    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setFormData((prev) => ({
        ...prev,
        name: parsedUser.name || "",
        email: parsedUser.email || "",
        phone: parsedUser.phone || prev.phone,
      }))
    } catch (error) {
      console.error("Error parsing user data:", error)
      window.location.href = "/login?redirect=/reservations"
    }
  }, [])

  // Check daily bookings count when date changes
  useEffect(() => {
    const checkDailyBookings = async () => {
      if (!formData.date || !user) return

      setCheckingBookings(true)
      try {
        const token = localStorage.getItem("auth_token")
        const response = await fetch(
          `/api/reservations/check-daily?date=${formData.date}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (response.ok) {
          const data = await response.json()
          setDailyBookingsCount(data.count || 0)
        }
      } catch (error) {
        console.error("Error checking daily bookings:", error)
      } finally {
        setCheckingBookings(false)
      }
    }

    checkDailyBookings()
  }, [formData.date, user])

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target
    
    // Clear email error when user types
    if (name === "email") {
      setEmailError("")
    }
    
    // If date changes, clear time if it becomes invalid
    if (name === "date") {
      setFormData((prev) => {
        const newData = { ...prev, [name]: value }
        // If new date is today and current time is in the past, clear it
        if (value === getMinDate() && prev.time) {
          const selectedDateTime = new Date(`${value}T${prev.time}`)
          if (selectedDateTime <= new Date()) {
            newData.time = ""
          }
        }
        return newData
      })
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  // Get minimum time if today is selected
  const getMinTime = () => {
    const today = new Date().toISOString().split("T")[0]
    if (formData.date === today) {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, "0")
      const minutes = String(now.getMinutes()).padStart(2, "0")
      return `${hours}:${minutes}`
    }
    return undefined
  }

  // Check if selected date/time is in the past
  const isPastDateTime = () => {
    if (!formData.date || !formData.time) return false
    const selectedDateTime = new Date(`${formData.date}T${formData.time}`)
    const now = new Date()
    return selectedDateTime <= now
  }

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Check if daily booking limit is reached
  const isDailyLimitReached = () => {
    return dailyBookingsCount >= 2
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.name.trim() !== ""
      case 2:
        return (
          formData.email.trim() !== "" &&
          isValidEmail(formData.email) &&
          formData.phone.trim() !== ""
        )
      case 3:
        if (formData.date === "" || formData.time === "") return false
        // Check if selected date and time is in the past
        if (isPastDateTime()) return false
        // Check if daily limit is reached
        if (isDailyLimitReached()) return false
        return true
      case 4:
        return !isDailyLimitReached()
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    // Final check for daily limit
    if (isDailyLimitReached()) {
      setMessage("You have reached the maximum of 2 reservations per day. Please choose a different date.")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const token = localStorage.getItem("auth_token")

      console.log("=== Reservation Submission Debug ===")
      console.log("User:", user)
      console.log("Token exists:", !!token)
      console.log("Form Data:", formData)

      if (!token) {
        window.location.href = "/login?redirect=/reservations"
        return
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      }

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers,
        body: JSON.stringify(formData),
      })

      console.log("Response status:", response.status)

      const data = await response.json()
      console.log("Response data:", data)

      if (!response.ok) {
        if (response.status === 400 && (data.message?.includes("maximum") || data.message?.includes("limit"))) {
          setMessage(data.message || "You have reached the maximum of 2 reservations for this date.")
        } else {
          setMessage(data.message || "Failed to create reservation")
        }
        return
      }

      setMessage("success")

      setTimeout(() => {
        setStep(1)
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",
          date: "",
          time: "",
          guests: "2",
          special_requests: "",
        })
        setMessage("")
        setDailyBookingsCount(0)
      }, 3000)
    } catch (error) {
      console.error("Reservation error:", error)
      setMessage("error")
    } finally {
      setLoading(false)
    }
  }

  if (message === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-3">Reservation Confirmed!</h2>
          <p className="text-xl text-gray-600 mb-2">We're excited to see you at Izakaya Tori Ichizu</p>
          <p className="text-gray-500 mb-6">Check your email for confirmation details</p>

          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">View your reservation</p>
            <button
              onClick={() => (window.location.href = "/orders")}
              className="text-orange-600 font-semibold hover:text-orange-700 underline bg-transparent border-none cursor-pointer"
            >
              Go to My Reservations
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setMessage("")
                setStep(1)
              }}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold rounded-xl transition-all"
            >
              Make Another Reservation
            </button>
            <button
              onClick={() => (window.location.href = "/menu")}
              className="flex-1 px-6 py-3 border-2 border-orange-300 text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-all"
            >
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-600">
              Reserve Your Spot
            </span>
          </h1>
          <p className="text-lg text-gray-600">Join us at Izakaya Tori Ichizu for an unforgettable dining experience</p>

          {user && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
              <User className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-gray-700">
                Booking as <span className="font-semibold text-gray-900">{user.name}</span>
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="relative">
            {/* Connection Lines */}
            <div className="absolute top-5 left-0 right-0 flex items-center px-5">
              <div className="flex-1 flex items-center justify-between">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 rounded transition-all duration-300 ${
                      i < step ? "bg-orange-500" : "bg-gray-200"
                    }`}
                    style={{ width: "calc(33.333% - 20px)" }}
                  />
                ))}
              </div>
            </div>

            {/* Step Circles */}
            <div className="relative flex justify-between mb-3">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 z-10 ${
                    s <= step
                      ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {s}
                </div>
              ))}
            </div>

            {/* Step Labels */}
            <div className="flex justify-between">
              <div className="text-center text-xs text-gray-600 font-medium" style={{ width: "40px" }}>
                Guest Info
              </div>
              <div className="text-center text-xs text-gray-600 font-medium" style={{ width: "40px" }}>
                Contact
              </div>
              <div className="text-center text-xs text-gray-600 font-medium" style={{ width: "40px" }}>
                Date & Time
              </div>
              <div className="text-center text-xs text-gray-600 font-medium" style={{ width: "40px" }}>
                Review
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-500 h-1" />

          <div className="p-8 md:p-10">
            {/* Step 1: Guest Info */}
            {step === 1 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's start with your name</h2>
                  <p className="text-gray-600">Help us personalize your reservation</p>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 w-5 h-5 text-orange-400 pointer-events-none" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your name"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Number of Guests *</label>
                      <div className="relative">
                        <Users className="absolute left-4 top-3.5 w-5 h-5 text-orange-400 pointer-events-none" />
                        <select
                          name="guests"
                          value={formData.guests}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-lg appearance-none bg-white"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <option key={num} value={num}>
                              {num} {num === 1 ? "Guest" : "Guests"}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-end">
                      <div className="w-full h-12 bg-orange-50 rounded-xl border-2 border-orange-100 flex items-center justify-center text-sm font-semibold text-orange-600">
                        Perfect for your group!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact */}
            {step === 2 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">How can we reach you?</h2>
                  <p className="text-gray-600">We'll send confirmation to this email</p>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-5 h-5 text-orange-400 pointer-events-none" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() => {
                          if (formData.email && !isValidEmail(formData.email)) {
                            setEmailError("Please enter a valid email address")
                          }
                        }}
                        required
                        placeholder="your@email.com"
                        disabled={!!user?.email}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all text-lg disabled:bg-gray-50 disabled:text-gray-600 ${
                          emailError
                            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        }`}
                      />
                    </div>
                    {user?.email && <p className="text-xs text-gray-500 mt-1">Using your account email</p>}
                    {emailError && !user?.email && (
                      <div className="mt-2 p-3 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700 text-sm font-medium">{emailError}</p>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 w-5 h-5 text-orange-400 pointer-events-none" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="+63 912 345 6789"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Date & Time */}
            {step === 3 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">When would you like to join us?</h2>
                  <p className="text-gray-600">Pick your preferred date and time</p>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Date *</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-orange-400 pointer-events-none" />
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={getMinDate()}
                        required
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-lg"
                      />
                    </div>
                    {checkingBookings && formData.date && (
                      <p className="text-xs text-gray-500 mt-1">Checking availability...</p>
                    )}
                    {!checkingBookings && formData.date && (
                      <div className="mt-2">
                        {isDailyLimitReached() ? (
                          <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-red-700 text-sm font-medium">
                                Maximum bookings reached for this date
                              </p>
                              <p className="text-red-600 text-xs mt-1">
                                You already have {dailyBookingsCount} reservation(s) on this date. Please choose a
                                different date.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-green-50 border-2 border-green-200 rounded-xl flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <p className="text-green-700 text-sm font-medium">
                              {dailyBookingsCount === 0
                                ? "Date available! You can make up to 2 reservations."
                                : `${2 - dailyBookingsCount} more reservation(s) available for this date.`}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Time *</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-3.5 w-5 h-5 text-orange-400 pointer-events-none" />
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        min={getMinTime()}
                        required
                        disabled={isDailyLimitReached()}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all text-lg disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          isPastDateTime()
                            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        }`}
                      />
                    </div>
                    {formData.date === getMinDate() && !isPastDateTime() && !isDailyLimitReached() && (
                      <p className="text-xs text-gray-500 mt-1">
                        Please select a time after{" "}
                        {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                      </p>
                    )}
                    {isPastDateTime() && !isDailyLimitReached() && (
                      <div className="mt-2 p-3 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700 text-sm font-medium">
                          This time has already passed. Please select a future time.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Special Requests */}
            {step === 4 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Anything special we should know?</h2>
                  <p className="text-gray-600">Dietary restrictions, celebrations, or special requests</p>
                </div>

                <div className="space-y-6">
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Your Reservation Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">Name</p>
                        <p className="font-semibold text-gray-900">{formData.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Guests</p>
                        <p className="font-semibold text-gray-900">{formData.guests}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Email</p>
                        <p className="font-semibold text-gray-900">{formData.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Phone</p>
                        <p className="font-semibold text-gray-900">{formData.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(formData.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Time</p>
                        <p className="font-semibold text-gray-900">{formData.time}</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Special Requests (Optional)
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-3.5 w-5 h-5 text-orange-400 pointer-events-none" />
                      <textarea
                        name="special_requests"
                        value={formData.special_requests}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Tell us about dietary needs, celebrations, or special occasions..."
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {message === "error" && (
              <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Something went wrong</p>
                  <p className="text-red-700 text-sm">Please check your information and try again</p>
                </div>
              </div>
            )}

            {message && message !== "success" && message !== "error" && (
              <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-900 text-sm">{message}</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-10">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => isStepValid() && setStep(step + 1)}
                  disabled={!isStepValid()}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !isStepValid()}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:cursor-not-allowed"
                >
                  {loading ? "Confirming..." : "Confirm Reservation"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          <div className="text-gray-600">
            <p className="font-semibold">⚡ Instant</p>
            <p className="text-sm">Confirmation</p>
          </div>
          <div className="text-gray-600">
            <p className="font-semibold">🔒 Secure</p>
            <p className="text-sm">Booking</p>
          </div>
          <div className="text-gray-600">
            <p className="font-semibold">📧 Email</p>
            <p className="text-sm">Reminder</p>
          </div>
        </div>

        {/* Booking Limit Info */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
          <p className="text-gray-700 text-sm">
            📅 <span className="font-semibold">Booking Policy:</span> Maximum of 2 reservations per day per user
          </p>
        </div>
      </div>
    </div>
  )
}
