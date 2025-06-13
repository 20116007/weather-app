import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-8">Weather App</h1>
        <p className="text-xl mb-8">Get real-time weather updates</p>
        <div className="space-x-4">
          <Link href="/login" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
            Login
          </Link>
          <Link href="/signup" className="border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}