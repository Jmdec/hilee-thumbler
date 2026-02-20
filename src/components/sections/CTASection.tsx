import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CTASection() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700">
      <div className="relative container mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white drop-shadow-lg leading-tight">
          <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
            Stylish & Durable
          </span>
          <br />
          <span className="text-purple-200 drop-shadow-xl">Tumblers for Everyday Life</span>
        </h2>

        <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-10 text-white/90 max-w-xl sm:max-w-2xl mx-auto leading-relaxed drop-shadow-md">
          Keep your drinks cold for 24 hours or hot for 12 — eco-friendly, reusable, and perfect for any lifestyle.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="text-lg sm:text-xl px-8 sm:px-10 py-4 sm:py-6 bg-white/95 backdrop-blur-sm text-purple-800 hover:bg-white hover:scale-105 transition-all duration-300 shadow-2xl border-2 border-white/20 font-semibold"
          >
            <Link href="/products">💧 Shop Tumblers</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="text-lg sm:text-xl px-8 sm:px-10 py-4 sm:py-6 border-2 border-white/80 text-white hover:bg-white/10 backdrop-blur-sm hover:scale-105 transition-all duration-300 shadow-xl font-semibold bg-transparent"
          >
            <Link href="/contact">📞 Contact Us</Link>
          </Button>
        </div>

        <div className="mt-6 sm:mt-8 text-white/70 text-sm sm:text-base">
          <span className="inline-block mx-2">💜</span>
          <span>Eco-Friendly, Stylish & Durable Tumblers</span>
          <span className="inline-block mx-2">💜</span>
        </div>
      </div>
    </section>
  )
}
