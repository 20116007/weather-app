// src/app/signup/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    
    if (response.ok) {
      setStep(3) // Success step
      setTimeout(() => router.push('/login'), 2000)
    } else {
      const data = await response.json()
      alert(data.error)
    }
    setLoading(false)
  }

  const nextStep = () => {
    if (step === 1 && name) setStep(2)
    else if (step === 2 && email && password) {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent
      handleSubmit(fakeEvent)
    }
  }

  // Helper for scrollIntoView on focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="min-h-screen overflow-y-auto relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-slate-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Improved flex layout for mobile usability */}
      <div className="relative z-10 px-4 py-8 flex flex-col justify-center">
        <div className="w-full max-w-md mx-auto pb-32">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-center space-x-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                    step >= s 
                      ? 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white shadow-lg' 
                      : 'bg-white/10 text-gray-400'
                  }`}>
                    {step > s ? '✓' : s}
                  </div>
                  {s < 3 && (
                    <div className={`w-16 h-1 mx-2 rounded transition-all duration-500 ${
                      step > s ? 'bg-gradient-to-r from-blue-400 to-indigo-400' : 'bg-white/20'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3D Card Container */}
          <div className="group perspective-1000">
            <div className="relative transform-gpu transition-all duration-700 preserve-3d group-hover:rotate-y-6">
              <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl min-h-[500px]">
                
                {/* Step 1: Personal Info */}
                {step === 1 && (
                  <div className="animate-slide-in">
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                        <span className="text-3xl">👋</span>
                      </div>
                    </div>

                    <div className="pt-8">
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 mb-2">
                          Welcome!
                        </h2>
                        <p className="text-blue-200/80">Let&apos;s get you started</p>
                      </div>

                      <div className="space-y-6">
                        <div className="relative group">
                          <input
                            type="text"
                            placeholder="Your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onFocus={handleFocus}
                            className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/50 focus:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                            required
                          />
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400">
                            👤
                          </div>
                        </div>

                        <button
                          onClick={nextStep}
                          disabled={!name}
                          className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          <span>Continue</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Account Details */}
                {step === 2 && (
                  <div className="animate-slide-in">
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                      <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                        <span className="text-3xl">🔐</span>
                      </div>
                    </div>

                    <div className="pt-8">
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200 mb-2">
                          Almost There!
                        </h2>
                        <p className="text-indigo-200/80">Create your secure account</p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative group">
                          <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={handleFocus}
                            className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400/50 focus:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                            required
                          />
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-indigo-400">
                            📧
                          </div>
                        </div>

                        <div className="relative group">
                          <input
                            type="password"
                            placeholder="Create password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={handleFocus}
                            className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/50 focus:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                            required
                          />
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400">
                            🔒
                          </div>
                        </div>

                        <div className="flex space-x-4">
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="flex-1 py-4 bg-white/5 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300"
                          >
                            ← Back
                          </button>
                          <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className="flex-2 py-4 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold rounded-xl hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                          >
                            {loading ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Creating...</span>
                              </>
                            ) : (
                              <>
                                <span>Create Account</span>
                                <span>✨</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Step 3: Success */}
                {step === 3 && (
                  <div className="animate-slide-in text-center">
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                        <span className="text-3xl">🎉</span>
                      </div>
                    </div>

                    <div className="pt-16">
                      <div className="mb-8">
                        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 mb-4">
                          Welcome Aboard!
                        </h2>
                        <p className="text-blue-200/80 text-lg">
                          Your account has been created successfully
                        </p>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-blue-400/20 border border-blue-400/30 rounded-xl p-6">
                          <div className="flex items-center justify-center space-x-3 text-blue-200">
                            <span className="text-2xl">✅</span>
                            <span className="font-semibold">Account Created</span>
                          </div>
                          <p className="text-blue-200/70 mt-2">
                            Redirecting you to login...
                          </p>
                        </div>

                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                          <span className="text-blue-200">Preparing your dashboard...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="text-center mt-8 space-y-4">
            <p className="text-gray-300">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-colors">
                Sign in here
              </Link>
            </p>
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
        
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.6s ease-out;
        }
        
        .flex-2 {
          flex: 2;
        }
      `}</style>
    </div>
  )
}