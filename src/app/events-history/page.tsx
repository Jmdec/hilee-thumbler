"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  CheckCircle,
  XCircle,
  User,
  LogIn,
  Calendar,
  Users,
  Mail,
  MapPin,
  ChefHat,
  Filter,
  Utensils,
} from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { useAuthStore } from "@/store/authStore"
import EventBookingModal from "@/components/event-booking-modal"

interface Event {
  id: number
  name: string
  email: string
  userId?: number
  event_type: string
  guests: number
  preferred_date: string
  preferred_time: string
  venue_area: string
  status?: string
  created_at: string
  updated_at?: string
}

const EventsHistory = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<string>("all")

  // Get user and token from Zustand store
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    const fetchEvents = async () => {
      // Check if user is logged in
      if (!user || !token) {
        console.log("❌ No user or token found")
        setLoading(false)
        return
      }

      console.log("=== Frontend Debug (Events) ===")
      console.log("User:", user)
      console.log("User ID:", user.id)
      console.log("Token:", token ? "Present" : "Missing")

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const eventsUrl = `${apiUrl}/api/events?user_id=${user.id}`

        console.log("Fetching from:", eventsUrl)

        const eventsResponse = await fetch(eventsUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })

        console.log("Response status:", eventsResponse.status)

        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          
          console.log("=== Backend Response (Events) ===")
          console.log("Full response:", eventsData)
          
          const eventsList = Array.isArray(eventsData) ? eventsData : eventsData.data || []
          
          console.log("✅ Events loaded:", eventsList.length)
          setEvents(eventsList)
          setFilteredEvents(eventsList)
        } else {
          const errorData = await eventsResponse.json()
          console.error("❌ Response not OK:", eventsResponse.status, errorData)
          toast({
            title: "Error",
            description: errorData.message || "Failed to load events",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("❌ Error fetching events:", error)
        toast({
          title: "Error",
          description: "Failed to load events. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [user, token])

  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredEvents(events)
    } else {
      setFilteredEvents(events.filter((event) => event.status === activeFilter))
    }
  }, [activeFilter, events])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "confirmed":
        return <ChefHat className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "cancelled":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30"
      case "confirmed":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "completed":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      case "cancelled":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const getStatusCount = (status: string) => {
    if (status === "all") return events.length
    return events.filter((event) => event.status === status).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold text-lg">Loading your events...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white shadow-2xl border-0">
          <CardContent className="p-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-3">Welcome Back</h1>
            <p className="text-gray-600 mb-8">Please log in to view your events history.</p>
            <div className="flex flex-col gap-3">
              <Link href="/login" className="w-full">
                <Button className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold py-6 text-lg shadow-lg">
                  <LogIn className="w-5 h-5 mr-2" />
                  Login to Continue
                </Button>
              </Link>
              <Link href="/register" className="w-full">
                <Button
                  variant="outline"
                  className="w-full border-2 border-orange-300 text-orange-600 hover:bg-orange-50 font-semibold py-6 text-lg bg-transparent"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Convert user to the format expected by EventBookingModal
  const modalUser = user ? {
    id: typeof user.id === 'string' ? parseInt(user.id) : user.id,
    name: user.name,
    email: user.email,
  } : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
                Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                  Events
                </span>
              </h1>
              <p className="text-gray-600 text-lg">Track your event bookings</p>
            </div>
            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-lg border border-orange-100">
              <User className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-xs text-gray-500">Welcome back,</p>
                <p className="font-bold text-gray-900">{user.name}</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-4 border border-orange-100">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-gray-700">Filter by Status</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  activeFilter === "all"
                    ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All ({getStatusCount("all")})
              </button>
              <button
                onClick={() => setActiveFilter("pending")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  activeFilter === "pending"
                    ? "bg-amber-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Pending ({getStatusCount("pending")})
              </button>
              <button
                onClick={() => setActiveFilter("confirmed")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  activeFilter === "confirmed"
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Confirmed ({getStatusCount("confirmed")})
              </button>
              <button
                onClick={() => setActiveFilter("completed")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  activeFilter === "completed"
                    ? "bg-emerald-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Completed ({getStatusCount("completed")})
              </button>
              <button
                onClick={() => setActiveFilter("cancelled")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  activeFilter === "cancelled"
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Cancelled ({getStatusCount("cancelled")})
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredEvents.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Card className="max-w-lg w-full bg-white shadow-2xl border-0">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Utensils className="w-12 h-12 text-orange-600" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-3">No Events Yet</h2>
                <p className="text-gray-600 mb-8 text-lg">
                  Book your first event and celebrate with us!
                </p>
                {/* Single Modal Button */}
                <div className="flex justify-center">
                  <EventBookingModal user={modalUser} />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvents.map((event) => (
              <Card
                key={event.id}
                className="bg-white shadow-xl hover:shadow-2xl py-0 transition-all border-0 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-black text-lg">Event #{event.id}</h3>
                      <p className="text-orange-100 text-sm">
                        {new Date(event.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <Badge
                      className={`${getStatusColor(event.status || "pending")} flex items-center gap-2 px-3 py-1 border`}
                    >
                      {getStatusIcon(event.status || "pending")}
                      <span className="capitalize font-semibold">
                        {(event.status || "pending").replace("_", " ")}
                      </span>
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-orange-600" />
                            <span className="text-xs text-gray-600 font-semibold">Date</span>
                          </div>
                          <p className="font-bold text-gray-900">
                            {new Date(event.preferred_date).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span className="text-xs text-gray-600 font-semibold">Time</span>
                          </div>
                          <p className="font-bold text-gray-900">{event.preferred_time}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-600">Guests:</span>
                        <span className="font-bold text-gray-900">{event.guests} people</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Utensils className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-600">Event Type:</span>
                        <span className="font-bold text-gray-900 capitalize">{event.event_type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-600">Venue:</span>
                        <span className="font-bold text-gray-900 capitalize">
                          {event.venue_area ? event.venue_area.replace("_", " ") : "Not specified"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-600">Name:</span>
                        <span className="font-bold text-gray-900">{event.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-600">Email:</span>
                        <span className="font-semibold text-gray-900">{event.email}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Bottom CTA - Single button at bottom */}
        {filteredEvents.length > 0 && (
          <div className="mt-12 flex justify-center">
            <EventBookingModal user={modalUser} />
          </div>
        )}
      </div>
    </div>
  )
}

export default EventsHistory
