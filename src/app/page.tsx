
import HeroSection from "@/components/sections/Hero"
import FeaturedMenu from "@/components/sections/FeaturedMenu"
import AboutPreview from "@/components/sections/HomePreview"
import CTASection from "@/components/sections/CTASection"
import ProductSection from "@/components/sections/ProductSection"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Menu Section - CHANGE INTO INFORMATION SECTION */}
      <FeaturedMenu />
      <div className="border-1 border-b-purple-200" />

      {/* Products Section */}
      <ProductSection />

      {/* About Preview Section */}
      <AboutPreview />

      {/* CTA Section */}
      <CTASection />
    </div>
  )
}
