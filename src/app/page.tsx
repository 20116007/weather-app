// src/app/page.tsx
'use client'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<any[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Create floating particles
    for (let i = 0; i < 50; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particlesRef.current.forEach(particle => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Animated Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
      />
      
      {/* Glassmorphism Background Elements */}
      <div className="absolute inset-0 z-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main Content - Mobile & Desktop Responsive */}
      <div className="relative z-20 h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto">
          
          {/* Responsive Weather Icon */}
          <div className="mb-4 sm:mb-6 md:mb-8 flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-xl sm:shadow-2xl animate-bounce transform hover:scale-110 transition-all duration-300">
                <div className="absolute inset-2 sm:inset-3 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full shadow-inner flex items-center justify-center">
                  <span className="text-lg sm:text-xl md:text-2xl">☀️</span>
                </div>
              </div>
              {/* Responsive floating cloud */}
              <div className="absolute -top-2 sm:-top-3 md:-top-4 -right-4 sm:-right-5 md:-right-6 w-8 h-6 sm:w-10 sm:h-7 md:w-12 md:h-8 bg-white/80 rounded-full animate-float">
                <div className="absolute top-0.5 sm:top-1 left-0.5 sm:left-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-white/60 rounded-full"></div>
                <div className="absolute top-0 right-0.5 sm:right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 bg-white/40 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Responsive Title */}
          <div className="mb-4 sm:mb-6 md:mb-8 space-y-1 sm:space-y-2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200 animate-gradient-x leading-tight">
              Weather
            </h1>
            <h2 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-indigo-200 to-white animate-gradient-x-reverse">
              Forecast
            </h2>
          </div>

          {/* Responsive subtitle */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-100 mb-4 sm:mb-6 md:mb-8 opacity-90 font-light leading-relaxed px-2 sm:px-0">
            Experience weather like never before with real-time updates
            <span className="hidden sm:inline"> and beautiful visuals</span>
          </p>

          {/* Responsive Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-4 sm:mb-6 md:mb-8 px-2 sm:px-0">
            <Link href="/login">
              <div className="group relative w-full sm:w-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <button className="relative w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl text-white font-semibold text-base sm:text-lg hover:scale-105 transform transition-all duration-300 flex items-center justify-center space-x-2">
                  <span>🚀</span>
                  <span>Get Started</span>
                </button>
              </div>
            </Link>

            <Link href="/signup">
              <div className="group relative w-full sm:w-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl sm:rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <button className="relative w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl text-white font-semibold text-base sm:text-lg hover:scale-105 transform transition-all duration-300 hover:bg-white/20 flex items-center justify-center space-x-2">
                  <span>✨</span>
                  <span>Create Account</span>
                </button>
              </div>
            </Link>
          </div>

          {/* Responsive Feature Cards */}
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 max-w-xs xs:max-w-md sm:max-w-2xl md:max-w-4xl mx-auto px-2 sm:px-0">
            {[
              { icon: "🌡️", title: "Real-time Data", desc: "Live updates" },
              { icon: "🎯", title: "Precise Forecasts", desc: "Accurate predictions" },
              { icon: "🎨", title: "Beautiful UI", desc: "Stunning visuals" }
            ].map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                  <div className="text-2xl sm:text-3xl mb-1 sm:mb-2 group-hover:animate-bounce">{feature.icon}</div>
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-0.5 sm:mb-1">{feature.title}</h3>
                  <p className="text-blue-200 opacity-80 text-xs sm:text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-size: 200% 200%; background-position: left center; }
          50% { background-size: 200% 200%; background-position: right center; }
        }
        
        @keyframes gradient-x-reverse {
          0%, 100% { background-size: 200% 200%; background-position: right center; }
          50% { background-size: 200% 200%; background-position: left center; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        .animate-gradient-x { animation: gradient-x 3s ease infinite; }
        .animate-gradient-x-reverse { animation: gradient-x-reverse 3s ease infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>
    </div>
  )
}