"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote, ChevronLeft, ChevronRight, X } from "lucide-react"

interface Testimonial {
  id: number
  client_name: string
  client_email: string
  rating: number
  message: string
  created_at: string
  image_url: string
  status?: string
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        // Add query parameter to fetch only approved testimonials
        const response = await fetch("/api/testimonials?status=approved")
        if (!response.ok) throw new Error("Failed to fetch testimonials")
        const data = await response.json()
        
        // Additional client-side filter to ensure only approved testimonials
        const approvedTestimonials = data.filter(
          (testimonial: Testimonial) => testimonial.status === "approved"
        )
        
        setTestimonials(approvedTestimonials)
      } catch (err) {
        console.error("Error fetching testimonials:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-700 to-yellow-600">
                What Our Guests Say
              </span>
            </h2>
            <p className="text-lg text-gray-600">Loading testimonials...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="py-20 bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-700 to-yellow-600">
                What Our Guests Say
              </span>
            </h2>
            <p className="text-lg text-gray-600">Real experiences from our valued customers</p>
          </div>

          {/* Testimonials Carousel */}
          {testimonials.length > 0 ? (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4">
                {/* Previous Button */}
                {testimonials.length > 1 && (
                  <button
                    onClick={prevSlide}
                    className="flex-shrink-0 bg-orange-600 hover:bg-orange-700 text-white rounded-full p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 relative z-50"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                )}

                {/* Single Card */}
                <Card
                onClick={() => setSelectedTestimonial(testimonials[currentIndex])}
                className="flex-1 group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-orange-100 overflow-hidden bg-white cursor-pointer"
              >
                <CardContent className="p-6 md:p-8 space-y-3 md:space-y-4">
                  {/* Quote Icon */}
                  <Quote className="w-10 h-10 text-orange-300" />

                  {/* Rating */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < testimonials[currentIndex].rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Message Preview - Truncated */}
                  <p className="text-gray-700 italic leading-relaxed line-clamp-3">
                    "{testimonials[currentIndex].message}"
                  </p>

                  {/* Read More */}
                  <p className="text-orange-600 font-semibold group-hover:text-orange-700">
                    Read more →
                  </p>

                  {/* Client Info */}
                  <div className="pt-4 border-t border-orange-100">
                    <p className="text-base md:text-lg font-semibold text-gray-800">
                      {testimonials[currentIndex].client_name}
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                      {new Date(testimonials[currentIndex].created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Next Button */}
              {testimonials.length > 1 && (
                <button
                  onClick={nextSlide}
                  className="flex-shrink-0 bg-orange-600 hover:bg-orange-700 text-white rounded-full p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 relative z-50"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              )}
              </div>

              {/* Dots Indicator */}
              {testimonials.length > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === currentIndex
                          ? "bg-orange-600 w-8"
                          : "bg-orange-200 hover:bg-orange-400 w-2"
                      }`}
                      aria-label={`Go to testimonial ${i + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Counter */}
              {testimonials.length > 1 && (
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500">
                    {currentIndex + 1} / {testimonials.length}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No testimonials yet. Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {selectedTestimonial && (
        <div
          className="fixed inset-0 bg-black/30 z-[9999] flex items-center justify-center p-4"
          onClick={() => setSelectedTestimonial(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-yellow-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{selectedTestimonial.client_name}</h3>
                  <p className="text-orange-100 text-sm mt-1">
                    {new Date(selectedTestimonial.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTestimonial(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Rating in Modal */}
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < selectedTestimonial.rating
                        ? "text-yellow-300 fill-yellow-300"
                        : "text-white text-opacity-30"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <Quote className="w-12 h-12 text-orange-300" />
              <p className="text-gray-700 text-lg leading-relaxed italic">
                "{selectedTestimonial.message}"
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
