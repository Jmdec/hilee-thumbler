"use client"

import { Droplets, Palette, Shield, Snowflake } from "lucide-react"

export default function FeaturedMenu() { //CHANGE INTO INFORMATION SECTION

  return (
    <section className="relative bg-white/95 py-16 overflow-hidden">
      {/* Header */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
            Why Choose <span className="text-purple-700">HILEE?</span>
          </h2>
          <p className="text-md md:text-lg lg:text-xl text-gray-700 max-w-lg lg:max-w-2xl mx-auto">
            Premium hydration at an unbeatable price — built for daily life, school, workouts & adventure.
          </p>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mx-10">
          <div className="border border-purple-50 rounded-xl bg-purple-50 hover:bg-purple-100 hover:border-purple-500 transition-all duration-200">
            <div className="p-5">
              <span className="text-purple-600 inline-block mb-2">
                <Snowflake className="w-8 h-8" />
              </span>

              <h3 className="text-xl font-bold mb-1">
                24-Hour Cold
              </h3>

              <p className="text-gray-600">
                Double-wall vacuum insulation keeps drinks ice-cold all day long.
              </p>
            </div>
          </div>

          <div className="border border-purple-50 rounded-xl bg-purple-50 hover:bg-purple-100 hover:border-purple-500 transition-all duration-200">
            <div className="p-5">
              <span className="text-purple-600 inline-block mb-2">
                <Shield className="w-8 h-8" />
              </span>

              <h3 className="text-xl font-bold mb-1">
                Food-Grade Steel
              </h3>

              <p className="text-gray-600">
                304 stainless steel — BPA-free, durable, and corrosion-resistant.
              </p>
            </div>
          </div>

          <div className="border border-purple-50 rounded-xl bg-purple-50 hover:bg-purple-100 hover:border-purple-500 transition-all duration-200">
            <div className="p-5">
              <span className="text-purple-600 inline-block mb-2">
                <Droplets className="w-8 h-8" />
              </span>

              <h3 className="text-xl font-bold mb-1">
                3-Way Lid
              </h3>

              <p className="text-gray-600">
                Sip, straw, or pour — versatile lids for every drinking style.              </p>
            </div>
          </div>

          <div className="border border-purple-50 rounded-xl bg-purple-50 hover:bg-purple-100 hover:border-purple-500 transition-all duration-200">
            <div className="p-5">
              <span className="text-purple-600 inline-block mb-2">
                <Palette className="w-8 h-8" />
              </span>

              <h3 className="text-xl font-bold mb-1">
                Custom Styles
              </h3>

              <p className="text-gray-600">
                Glossy, matte, and signature series with free name printing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
