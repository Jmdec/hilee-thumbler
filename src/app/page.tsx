import { menuItems } from "@/data/menuData"
import HeroSection from "@/components/sections/Hero"
import FeaturedMenu from "@/components/sections/FeaturedMenu"
import AboutPreview from "@/components/sections/HomePreview"
import CTASection from "@/components/sections/CTASection"
import ProductSection from "@/components/sections/ProductSection"
import TestimonialsSection from "@/components/testimonials-section"
import BlogSection from "@/components/blog-section"

export default function Home() {
  const featuredItems = menuItems.slice(0, 3)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Menu Section - CHANGE INTO INFORMATION SECTION */}
      <FeaturedMenu /> 

      {/* Products Section */}
      <ProductSection />

      {/* About Preview Section */}
      <AboutPreview />

      {/* CTA Section */}
      <CTASection />
    </div>
  )
}
