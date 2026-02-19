"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MapPin, Phone, Mail, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SupportModal } from "@/components/support-modal"

const Footer = () => {
  const pathname = usePathname()
  const [supportModalOpen, setSupportModalOpen] = useState(false)

  // Hide footer in admin routes
  if (pathname.startsWith("/admin")) return null

  return (
    <>
      <footer className="bg-purple-950 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {/* Logo + Description */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-4xl font-bold text-purple-500">Hilee</span>
              </div>
              <p className="text-white/80 text-md sm:text-base">
                Stylish, durable, and eco-friendly tumblers — keeping your drinks perfect anytime, anywhere.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-200">Quick Links</h3>
              <nav className="flex flex-col space-y-2">
                <Link href="/" className="text-white/80 hover:text-purple-400 transition-colors text-sm sm:text-base">
                  Home
                </Link>
                <Link href="/shop" className="text-white/80 hover:text-purple-400 transition-colors text-sm sm:text-base">
                  Products
                </Link>
                <Link href="/contact" className="text-white/80 hover:text-purple-400 transition-colors text-sm sm:text-base">
                  Contact
                </Link>
              </nav>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-200">Hilee</h3>
              <div className="space-y-2 text-sm sm:text-base">
                <Link
                  href="https://www.google.com/maps/place/Your+Address"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 hover:text-purple-400 transition-colors"
                >
                  <MapPin className="h-4 w-4 text-white/60" />
                  <span className="text-white/80">
                    123 Main St, City, Country
                  </span>
                </Link>
                <Link href="tel:+1234567890" className="flex items-center space-x-2 hover:text-purple-400 transition-colors">
                  <Phone className="h-4 w-4 text-white/60" />
                  <span className="text-white/80">+1 234 567 890</span>
                </Link>
                <Link href="mailto:info@tumblers.com" className="flex items-center space-x-2 hover:text-purple-400 transition-colors">
                  <Mail className="h-4 w-4 text-white/60" />
                  <span className="text-white/80">info@tumblers.com</span>
                </Link>
              </div>
            </div>

            {/* Support Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-200">Support</h3>
              <p className="text-white/80 text-sm sm:text-base mb-3">Need help? Our support team is ready to assist.</p>
              <Button
                onClick={() => setSupportModalOpen(true)}
                className="w-full bg-purple-400 hover:bg-purple-500 text-black font-semibold flex items-center justify-center gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                Get Support
              </Button>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-white/20 mt-8 pt-6 text-center space-y-2 text-sm sm:text-base">
            <p className="text-white/60">© 2026 Hilee. All rights reserved.</p>
            <p className="text-white/50">
              Powered by{" "}
              <Link
                href="https://infinitechphil.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-400 transition-colors"
              >
                Infinitech Advertising Corporation
              </Link>
            </p>
          </div>
        </div>
      </footer>

      <SupportModal open={supportModalOpen} onOpenChange={setSupportModalOpen} />
    </>
  )
}

export default Footer
