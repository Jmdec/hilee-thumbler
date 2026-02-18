"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react"

interface BlogPost {
  id: number
  title: string
  excerpt: string
  content: string
  author: string
  created_at: string
  video_url?: string
  thumbnail_url?: string
}

export default function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/blog-posts")
        if (!response.ok) throw new Error("Failed to fetch blog posts")
        const data = await response.json()
        setPosts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [selectedPost])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(posts.length / 3))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(posts.length / 3)) % Math.ceil(posts.length / 3))
  }

  const visiblePosts = posts.slice(currentIndex * 3, currentIndex * 3 + 3)

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              OUR <span className="text-orange-700">BLOG</span>
            </h2>
            <p className="text-xl text-gray-700">Loading blog posts...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm border-2 border-red-300 rounded-2xl p-8 text-center shadow-xl">
              <p className="text-red-600 text-lg font-semibold">⚠️ {error}</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="py-20 bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 drop-shadow-sm">
              OUR <span className="text-orange-700 drop-shadow-sm">BLOG</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto drop-shadow-sm">
              Discover stories, recipes, and insights from our kitchen
            </p>
          </div>

          {/* Blog Posts Carousel */}
          {posts.length > 0 ? (
            <div className="max-w-7xl mx-auto relative z-[100]">
              <div className="flex items-center gap-4">
                {/* Previous Button */}
                {posts.length > 3 && (
                  <button
                    onClick={prevSlide}
                    className="flex-shrink-0 bg-orange-600 hover:bg-orange-700 text-white rounded-full p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 relative z-[101] pointer-events-auto"
                    aria-label="Previous posts"
                  >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                )}

                {/* Cards Grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visiblePosts.map((post, index) => (
                    <div
                      key={post.id}
                      className="group overflow-hidden rounded-lg border-2 border-orange-100/50 hover:border-orange-300 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                      onClick={() => setSelectedPost(post)}
                    >
                      {/* Thumbnail/Video Preview */}
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-orange-100 to-yellow-100">
                        {post.thumbnail_url ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}${post.thumbnail_url}`}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg"
                            }}
                          />
                        ) : post.video_url ? (
                          <video
                            src={`${process.env.NEXT_PUBLIC_API_URL}${post.video_url}`}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl">
                            🍽️
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Video indicator */}
                        {post.video_url && (
                          <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            ▶️ Video
                          </div>
                        )}

                        {/* Date badge */}
                        <div className="absolute top-3 right-3 bg-orange-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                          {new Date(post.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="text-lg font-bold line-clamp-2 group-hover:text-orange-600 transition-colors leading-tight mb-2">
                          {post.title}
                        </h3>

                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
                          {post.excerpt}
                        </p>

                        {/* Author info */}
                        <div className="flex items-center gap-2 pt-2 mb-3 border-t border-orange-100">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold">
                            {post.author.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">
                              {post.author}
                            </p>
                          </div>
                        </div>

                        {/* Read More Link */}
                        <p className="text-orange-600 text-sm font-semibold group-hover:text-orange-700">
                          Read more →
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Next Button */}
                {posts.length > 3 && (
                  <button
                    onClick={nextSlide}
                    className="flex-shrink-0 bg-orange-600 hover:bg-orange-700 text-white rounded-full p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 relative z-[101] pointer-events-auto"
                    aria-label="Next posts"
                  >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                )}
              </div>

              {/* Dots Indicator */}
              {posts.length > 3 && (
                <div className="flex justify-center gap-2 mt-8">
                  {[...Array(Math.ceil(posts.length / 3))].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === currentIndex ? "bg-orange-600 w-8" : "bg-orange-200 hover:bg-orange-400 w-2"
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-block p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-orange-200">
                <div className="text-7xl mb-6">📝</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">No Stories Yet</h2>
                <p className="text-gray-600 text-lg">Check back soon for delicious content!</p>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes blob {
            0%,
            100% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
          }

          .animate-blob {
            animation: blob 7s infinite;
          }

          .animation-delay-2000 {
            animation-delay: 2s;
          }

          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </section>

      {/* Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Video or Thumbnail */}
            <div className="relative h-48 md:h-64 lg:h-96 overflow-hidden bg-gradient-to-br from-orange-100 to-yellow-100">
              {selectedPost.video_url ? (
                <video
                  src={`${process.env.NEXT_PUBLIC_API_URL}${selectedPost.video_url}`}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                />
              ) : selectedPost.thumbnail_url ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${selectedPost.thumbnail_url}`}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">🍽️</div>
              )}

              {/* Close button */}
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"
              >
                <X className="w-6 h-6 text-gray-800" />
              </button>

              {/* Date badge */}
              {!selectedPost.video_url && (
                <div className="absolute top-4 left-4 bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  {new Date(selectedPost.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              )}
            </div>

            {/* Modal Content */}
            <div className="p-4 md:p-8">
              {/* Title */}
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {selectedPost.title}
              </h2>

              {/* Author info */}
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 pb-4 md:pb-6 border-b border-gray-200">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-base md:text-lg font-bold flex-shrink-0">
                  {selectedPost.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-base md:text-lg font-semibold text-gray-800">{selectedPost.author}</p>
                  <p className="text-xs md:text-sm text-gray-500">Recipe Creator</p>
                </div>
              </div>

              {/* Excerpt */}
              <div className="mb-4 md:mb-6">
                <p className="text-base md:text-xl text-gray-700 leading-relaxed italic border-l-4 border-orange-600 pl-3 md:pl-4">
                  {selectedPost.excerpt}
                </p>
              </div>

              {/* Content */}
              <div className="prose prose-sm md:prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedPost.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
