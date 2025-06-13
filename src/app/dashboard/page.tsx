'use client'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface WeatherData {
  name: string
  main: {
    temp: number
    humidity: number
    feels_like: number
  }
  weather: [{
    main: string
    description: string
    icon: string
  }]
  wind: {
    speed: number
  }
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [city, setCity] = useState('London')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const fetchWeather = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/weather?city=${city}`)
      const data = await response.json()
      setWeather(data)
    } catch (error) {
      console.error('Error fetching weather:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (session) {
      fetchWeather()
    }
  }, [session])

  if (status === 'loading') return <div>Loading...</div>
  if (!session) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome, {session.user?.name}!</h1>
          <button
            onClick={() => signOut()}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Enter city name"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={fetchWeather}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Get Weather'}
            </button>
          </div>

          {weather && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">{weather.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800">Temperature</h3>
                  <p className="text-2xl font-bold text-blue-600">{Math.round(weather.main.temp)}°C</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800">Feels Like</h3>
                  <p className="text-2xl font-bold text-green-600">{Math.round(weather.main.feels_like)}°C</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800">Humidity</h3>
                  <p className="text-2xl font-bold text-purple-600">{weather.main.humidity}%</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-800">Wind Speed</h3>
                  <p className="text-2xl font-bold text-orange-600">{weather.wind.speed} m/s</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-lg capitalize">{weather.weather[0].description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}