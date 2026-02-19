import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, Award, Flame, Sprout, Brush, Gift } from "lucide-react"

export default function HomePreview() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-purple-50 to-white">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/40 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-purple-200/20 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-purple-300/25 rounded-full blur-xl animate-pulse delay-700"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-lg font-medium text-purple-700 tracking-wide">ABOUT US</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-purple-600 to-purple-600">
                Hilee
              </span>
            </h1>

            <p className="text-xl text-gray-700 leading-relaxed">
              HILEE started with a simple mission: make premium-quality insulated drinkware accessible to everyone. Born in the Philippines, we&apos;ve become a go-to brand for students, athletes, and adventurers who refuse to compromise on quality or style.

            </p>

            <p className="text-xl text-gray-600 leading-relaxed">
              Every HILEE flask is crafted from 304 food-grade stainless steel with double-wall vacuum insulation — keeping your drinks ice-cold for 24 hours or piping hot for up to 8. With free name printing, paracord handles, and a range of stunning finishes, your flask is as unique as you are.

            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/products">View Our Products</Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-purple-600 text-purple-700 hover:bg-purple-600 hover:text-white px-8 py-3 text-lg font-semibold transition-all duration-300 bg-transparent"
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 auto-rows-fr">
            {[
              {
                icon: <Flame className="w-8 h-8 text-white" />,
                title: "Proudly Filipino",
                desc: "Designed and made with local craftsmanship",
                bg: "from-purple-900 to-purple-700",
              },
              {
                icon: <Sprout className="w-8 h-8 text-white" />,
                title: "Eco-Friendly",
                desc: "Reusable tumblers that help reduce waste",
                bg: "from-purple-500 to-purple-400",
              },
              {
                icon: <Brush className="w-8 h-8 text-white" />,
                title: "Customizable",
                desc: "Personalize your tumbler to match your style",
                bg: "from-purple-500 to-purple-400",
              },
              {
                icon: <Gift className="w-8 h-8 text-white" />,
                title: "Perfect Gift",
                desc: "Stylish tumblers ideal for friends and family",
                bg: "from-purple-900 to-purple-700",
              },
            ].map((card, idx) => (
              <Card
                key={idx}
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border border-purple-100 h-full flex flex-col"
              >
                <CardContent className="p-8 text-center flex flex-col flex-1">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${card.bg} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {card.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-800">{card.title}</h3>
                  <p className="text-sm text-gray-600 flex-1">{card.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
