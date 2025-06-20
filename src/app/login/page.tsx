// src/app/login/page.tsx
'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    
    if (result?.ok) {
      router.push('/dashboard')
    } else {
      alert('Invalid credentials')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-slate-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Changed flex layout for better mobile usability */}
      <div className="relative z-10 min-h-screen px-4 py-8 flex flex-col justify-center">
        <div className="w-full max-w-md mx-auto">
          {/* 3D Card Container */}
          <div className="group perspective-1000">
            <div className="relative transform-gpu transition-all duration-700 preserve-3d group-hover:rotate-y-6">
              {/* Main Card */}
              <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
                {/* Decorative Elements */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                    <span className="text-3xl">🔐</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="pt-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 mb-2">
                      Welcome Back
                    </h2>
                    <p className="text-blue-200/80">Sign in to your weather dashboard</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div className="relative group">
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400/50 focus:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                        required
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-indigo-400">
                        📧
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="relative group">
                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/50 focus:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                        required
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400">
                        🔒
                      </div>
                    </div>

                    {/* Login Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In</span>
                          <span>🚀</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white/5 text-gray-400 rounded-full">or</span>
                    </div>
                  </div>

                  {/* Sign Up Link */}
                  <div className="text-center">
                    <p className="text-gray-300">
                      Don&apos;t have an account?{' '}
                      <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-colors">
                        Create one now
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Link href="/" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <span>←</span>
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .rotate-y-6 { transform: rotateY(6deg); }
      `}</style>
    </div>
  )
}