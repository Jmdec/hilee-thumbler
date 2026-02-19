import { useState, useEffect } from "react"

export default function IzakayaLoader() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-purple-800 via-purple-900 to-purple-800 overflow-hidden">
      {/* Soft floating blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-pink-300 rounded-full blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-10 left-1/2 w-72 h-72 bg-blue-300 rounded-full blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <style>{`
        @keyframes blob {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px,-50px) scale(1.1); }
          66% { transform: translate(-20px,20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>

      <div className="text-center relative z-10">
        {/* Tumbler */}
        <div className="py-20 flex justify-center">
          <div className="relative w-28 h-52">
            {/* Lid */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-8 bg-white rounded-t-xl shadow" />

            {/* Body */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-44 bg-white rounded-2xl shadow-2xl border overflow-hidden">
              {/* Liquid fill */}
              <div className="absolute bottom-0 w-full h-2/3 bg-gradient-to-t from-pink-400 via-purple-400 to-blue-400 animate-liquid" />

              {/* Shine */}
              <div className="absolute top-0 left-4 w-6 h-full bg-white blur-md" />
            </div>

            {/* Straw */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-2 h-10 bg-purple-400 rounded-full" />
          </div>
        </div>

        {/* Brand */}
        <h1 className="text-4xl lg:text-6xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
          HILEE
        </h1>

        <p className="mt-3 text-purple-300 text-2xl lg:text-3xl tracking-widest">
          Refreshing your experience
        </p>

        {/* Loading dots */}
        <div className="flex justify-center gap-2 mt-8">
          <div className="w-4 h-4 bg-purple-300 rounded-full animate-bounce" />
          <div className="w-4 h-4 bg-purple-300 rounded-full animate-bounce delay-150" />
          <div className="w-4 h-4 bg-purple-300 rounded-full animate-bounce delay-300" />
        </div>

        <style>{`
          @keyframes liquid {
            0% { height: 55%; }
            50% { height: 70%; }
            100% { height: 55%; }
          }
          .animate-liquid {
            animation: liquid 2.5s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  )
}
