// src/app/dashboard/page.tsx
'use client'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface WeatherData {
  name: string
  main: {
    temp: number
    humidity: number
    feels_like: number
    pressure: number
  }
  weather: [{
    main: string
    description: string
    icon: string
  }]
  wind: {
    speed: number
    deg: number
  }
  visibility: number
  clouds: {
    all: number
  }
  coord: {
    lat: number
    lon: number
  }
}

interface HourlyForecast {
  dt: number
  main: {
    temp: number
  }
  weather: [{
    main: string
    icon: string
  }]
  wind: {
    speed: number
  }
}

interface MonthlyForecast {
  dt: number
  temp: {
    day: number
    min: number
    max: number
  }
  weather: [{
    main: string
    description: string
    icon: string
  }]
  humidity: number
  wind_speed: number
  week: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([])
  const [monthlyForecast, setMonthlyForecast] = useState<MonthlyForecast[]>([])
  const [city, setCity] = useState('London')
  const [loading, setLoading] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'current' | 'hourly' | 'monthly' | 'map'>('current')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Animated weather particles
  useEffect(() => {
    if (!weather || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles: any[] = []
    const particleCount = weather.weather[0].main === 'Rain' ? 100 : 
                         weather.weather[0].main === 'Snow' ? 50 : 30

    // Create weather-appropriate particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 3 + 1,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.7 + 0.3
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(particle => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.y > canvas.height) {
          particle.y = -5
          particle.x = Math.random() * canvas.width
        }
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1
        }

        ctx.beginPath()
        if (weather.weather[0].main === 'Rain') {
          ctx.strokeStyle = `rgba(100, 149, 237, ${particle.opacity})`
          ctx.lineWidth = particle.size
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(particle.x - 2, particle.y + 8)
          ctx.stroke()
        } else {
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`
          ctx.fill()
        }
      })

      requestAnimationFrame(animate)
    }

    animate()
  }, [weather])

  // Initialize map when map tab is active - Fixed overlapping issues
  useEffect(() => {
    if (activeTab === 'map' && weather && mapRef.current) {
      const mapContainer = mapRef.current
      const lat = weather.coord.lat
      const lon = weather.coord.lon
      
      mapContainer.innerHTML = `
        <div class="w-full h-full bg-slate-900/50 rounded-2xl overflow-hidden border border-white/20 relative">
          <!-- Map iframe - full area without overlaps -->
          <iframe 
            src="https://openweathermap.org/weathermap?basemap=map&cities=false&layer=temperature&lat=${lat}&lon=${lon}&zoom=8"
            class="w-full h-full border-0 rounded-2xl"
            style="min-height: 500px;"
            loading="lazy">
          </iframe>
          
          <!-- Non-overlapping info panel - positioned at bottom -->
          <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-2xl">
            <div class="flex justify-between items-end">
              <div class="text-white">
                <div class="text-2xl font-bold mb-1">${weather.name}</div>
                <div class="text-white/80 text-sm">Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}</div>
              </div>
              <div class="text-right text-white">
                <div class="text-3xl font-bold">${Math.round(weather.main.temp)}°C</div>
                <div class="text-white/80 text-sm">${weather.weather[0].description}</div>
              </div>
            </div>
          </div>
          
          <!-- Layer controls - positioned at top right, non-overlapping -->
          <div class="absolute top-4 right-4 flex flex-col space-y-2">
            <button onclick="changeMapLayer('temp')" class="px-4 py-2 bg-red-500/80 backdrop-blur-sm text-white text-sm rounded-lg hover:bg-red-500 transition-colors border border-white/20">
              🌡️ Temperature
            </button>
            <button onclick="changeMapLayer('precipitation')" class="px-4 py-2 bg-blue-500/80 backdrop-blur-sm text-white text-sm rounded-lg hover:bg-blue-500 transition-colors border border-white/20">
              🌧️ Rain
            </button>
            <button onclick="changeMapLayer('clouds')" class="px-4 py-2 bg-gray-500/80 backdrop-blur-sm text-white text-sm rounded-lg hover:bg-gray-500 transition-colors border border-white/20">
              ☁️ Clouds
            </button>
            <button onclick="changeMapLayer('wind')" class="px-4 py-2 bg-green-500/80 backdrop-blur-sm text-white text-sm rounded-lg hover:bg-green-500 transition-colors border border-white/20">
              💨 Wind
            </button>
          </div>
          
          <!-- Quick stats - positioned at top left, compact -->
          <div class="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div class="grid grid-cols-2 gap-3 text-white text-sm">
              <div class="text-center">
                <div class="text-white/70">Wind</div>
                <div class="font-bold">${weather.wind.speed}m/s</div>
              </div>
              <div class="text-center">
                <div class="text-white/70">Humidity</div>
                <div class="font-bold">${weather.main.humidity}%</div>
              </div>
            </div>
          </div>
        </div>
      `
      
      // Add global function for layer switching
      if (typeof window !== 'undefined') {
        (window as any).changeMapLayer = (layer: string) => {
          const iframe = mapContainer.querySelector('iframe') as HTMLIFrameElement
          if (iframe) {
            const layerMap = {
              'temp': 'temperature',
              'precipitation': 'precipitation_new', 
              'clouds': 'clouds_new',
              'wind': 'wind_new'
            }
            const newSrc = `https://openweathermap.org/weathermap?basemap=map&cities=false&layer=${layerMap[layer as keyof typeof layerMap]}&lat=${lat}&lon=${lon}&zoom=8`
            iframe.src = newSrc
          }
        }
      }
    }
  }, [activeTab, weather])

  const fetchWeather = async () => {
    setLoading(true)
    try {
      // Fetch current weather
      const weatherResponse = await fetch(`/api/weather?city=${city}`)
      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data')
      }
      const weatherData = await weatherResponse.json()
      setWeather(weatherData)
      
      // Fetch hourly forecast
      try {
        const hourlyResponse = await fetch(`/api/forecast?city=${city}&type=hourly`)
        if (hourlyResponse.ok) {
          const hourlyData = await hourlyResponse.json()
          setHourlyForecast(hourlyData.hourly || [])
        }
      } catch (error) {
        console.error('Error fetching hourly forecast:', error)
        // Fallback to mock data
        const hourlyData: HourlyForecast[] = Array.from({ length: 24 }, (_, i) => ({
          dt: Date.now() + (i * 3600000),
          main: { temp: weatherData.main.temp + (Math.random() * 6 - 3) },
          weather: [{ main: weatherData.weather[0].main, icon: weatherData.weather[0].icon }],
          wind: { speed: weatherData.wind.speed + (Math.random() * 2 - 1) }
        }))
        setHourlyForecast(hourlyData)
      }

      // Fetch monthly forecast  
      try {
        const monthlyResponse = await fetch(`/api/forecast?city=${city}&type=monthly`)
        if (monthlyResponse.ok) {
          const monthlyData = await monthlyResponse.json()
          setMonthlyForecast(monthlyData.monthly || [])
        }
      } catch (error) {
        console.error('Error fetching monthly forecast:', error)
        // Fallback to mock monthly data (30 days)
        const monthlyData: MonthlyForecast[] = Array.from({ length: 30 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() + i)
          return {
            dt: date.getTime(),
            temp: {
              day: weatherData.main.temp + (Math.random() * 15 - 7.5),
              min: weatherData.main.temp - (Math.random() * 8 + 3),
              max: weatherData.main.temp + (Math.random() * 8 + 3)
            },
            weather: [{
              main: i % 4 === 0 ? 'Rain' : i % 3 === 0 ? 'Clouds' : 'Clear',
              description: weatherData.weather[0].description,
              icon: weatherData.weather[0].icon
            }],
            humidity: weatherData.main.humidity + (Math.random() * 30 - 15),
            wind_speed: weatherData.wind.speed + (Math.random() * 4 - 2),
            week: Math.floor(i / 7) + 1
          }
        })
        setMonthlyForecast(monthlyData)
      }
      
      // Add to search history
      if (!searchHistory.includes(city)) {
        setSearchHistory(prev => [city, ...prev.slice(0, 4)])
      }
    } catch (error) {
      console.error('Error fetching weather:', error)
      alert('Failed to fetch weather data. Please try again.')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (session) {
      fetchWeather()
    }
  }, [session])

  const getWeatherIcon = (weatherMain: string) => {
    const icons = {
      Clear: '☀️',
      Clouds: '☁️',
      Rain: '🌧️',
      Snow: '❄️',
      Thunderstorm: '⛈️',
      Drizzle: '🌦️',
      Mist: '🌫️',
      Fog: '🌫️'
    }
    return icons[weatherMain as keyof typeof icons] || '🌤️'
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading your weather dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Background Effects */}
      <div className="absolute inset-0 bg-black/20" style={{ zIndex: 2 }}></div>
      
      <div className="relative z-10 min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Welcome back, {session.user?.name}! 👋
              </h1>
              <p className="text-white/80 text-lg">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 rounded-full p-3">
                <span className="text-2xl">{weather ? getWeatherIcon(weather.weather[0].main) : '🌤️'}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="bg-red-500/80 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-8 border border-white/20">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <input
                  type="text"
                  placeholder="Enter city name..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="relative w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-300 text-lg backdrop-blur-sm"
                  onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60">
                  🔍
                </div>
              </div>
              <button
                onClick={fetchWeather}
                disabled={loading}
                className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 backdrop-blur-sm"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <span>Get Weather</span>
                    <span>🚀</span>
                  </>
                )}
              </button>
            </div>

            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="mt-4">
                <p className="text-white/80 text-sm mb-2">Recent searches:</p>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((historyCity, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCity(historyCity)
                        fetchWeather()
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full text-sm transition-all duration-200 backdrop-blur-sm"
                    >
                      {historyCity}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20">
              <div className="flex space-x-2">
                {[
                  { id: 'current', label: 'Current Weather', icon: '🌤️' },
                  { id: 'hourly', label: 'Hourly', icon: '⏰' },
                  { id: 'monthly', label: 'Monthly Forecast', icon: '📊' },
                  { id: 'map', label: 'Map View', icon: '🗺️' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                      activeTab === tab.id
                        ? 'bg-blue-500/80 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Sections */}
          {weather && (
            <div className="space-y-8">
              {/* Current Weather */}
              {activeTab === 'current' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Weather Card */}
                  <div className="lg:col-span-2">
                    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 relative overflow-hidden group hover:scale-105 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h2 className="text-4xl font-bold text-white mb-2">{weather.name}</h2>
                            <p className="text-white/80 text-xl capitalize">{weather.weather[0].description}</p>
                          </div>
                          <div className="text-8xl animate-bounce">
                            {getWeatherIcon(weather.weather[0].main)}
                          </div>
                        </div>

                        <div className="flex items-end space-x-4 mb-8">
                          <div className="text-7xl font-bold text-white">
                            {Math.round(weather.main.temp)}°
                          </div>
                          <div className="text-white/80 text-2xl mb-4">
                            Feels like {Math.round(weather.main.feels_like)}°
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                            <div className="text-white/80 text-sm">Humidity</div>
                            <div className="text-2xl font-bold text-white">{weather.main.humidity}%</div>
                          </div>
                          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                            <div className="text-white/80 text-sm">Wind Speed</div>
                            <div className="text-2xl font-bold text-white">{weather.wind.speed} m/s</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weather Details */}
                  <div className="space-y-6">
                    {[
                      { icon: "🌡️", label: "Pressure", value: `${weather.main.pressure} hPa`, color: "from-red-400 to-pink-500" },
                      { icon: "👁️", label: "Visibility", value: `${(weather.visibility / 1000).toFixed(1)} km`, color: "from-green-400 to-blue-500" },
                      { icon: "☁️", label: "Cloudiness", value: `${weather.clouds.all}%`, color: "from-gray-400 to-gray-600" },
                      { icon: "🧭", label: "Wind Direction", value: `${weather.wind.deg}°`, color: "from-purple-400 to-indigo-500" }
                    ].map((item, index) => (
                      <div key={index} className="group">
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:scale-105 transition-all duration-300 relative overflow-hidden">
                          <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-20 transition-all duration-300`}></div>
                          <div className="relative z-10 flex items-center space-x-4">
                            <div className="text-3xl">{item.icon}</div>
                            <div>
                              <div className="text-white/80 text-sm">{item.label}</div>
                              <div className="text-xl font-bold text-white">{item.value}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hourly Forecast */}
              {activeTab === 'hourly' && (
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                    <span>⏰</span>
                    <span>24-Hour Forecast</span>
                  </h3>
                  {hourlyForecast.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                      {hourlyForecast.slice(0, 24).map((hour, index) => (
                        <div key={index} className="bg-white/10 rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300 backdrop-blur-sm">
                          <div className="text-white/70 text-sm mb-2">
                            {index === 0 ? 'Now' : formatTime(hour.dt)}
                          </div>
                          <div className="text-3xl mb-2">
                            {getWeatherIcon(hour.weather[0].main)}
                          </div>
                          <div className="text-white font-bold text-lg">
                            {Math.round(hour.main.temp)}°
                          </div>
                          <div className="text-white/60 text-sm mt-1">
                            {hour.wind.speed.toFixed(1)} m/s
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">⏰</div>
                      <div className="text-white/70 text-lg">Loading hourly forecast...</div>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50 mx-auto mt-4"></div>
                    </div>
                  )}
                </div>
              )}

              {/* Monthly Forecast */}
              {activeTab === 'monthly' && (
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                    <span>📊</span>
                    <span>30-Day Monthly Forecast</span>
                  </h3>
                  {monthlyForecast.length > 0 ? (
                    <div className="space-y-6">
                      {/* Group by weeks */}
                      {[1, 2, 3, 4].map(weekNum => {
                        const weekData = monthlyForecast.filter(day => day.week === weekNum)
                        if (weekData.length === 0) return null
                        
                        return (
                          <div key={weekNum} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                              <span>📅</span>
                              <span>Week {weekNum}</span>
                              <span className="text-white/60 text-sm">
                                ({new Date(weekData[0].dt).toLocaleDateString()} - {new Date(weekData[weekData.length - 1].dt).toLocaleDateString()})
                              </span>
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                              {weekData.map((day, index) => (
                                <div key={index} className="bg-white/10 rounded-xl p-4 text-center hover:scale-105 transition-all duration-300 backdrop-blur-sm">
                                  <div className="text-white/70 text-sm mb-2">
                                    {new Date(day.dt).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                                  </div>
                                  <div className="text-3xl mb-2">
                                    {getWeatherIcon(day.weather[0].main)}
                                  </div>
                                  <div className="text-white font-bold text-lg mb-1">
                                    {Math.round(day.temp.day)}°
                                  </div>
                                  <div className="flex justify-between text-xs text-white/60">
                                    <span>{Math.round(day.temp.max)}°</span>
                                    <span>{Math.round(day.temp.min)}°</span>
                                  </div>
                                  <div className="text-white/50 text-xs mt-1">
                                    {Math.round(day.humidity)}% | {day.wind_speed.toFixed(1)}m/s
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Week Summary */}
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-white/5 rounded-xl p-3 text-center">
                                <div className="text-white/70 text-sm">Avg Temp</div>
                                <div className="text-white font-bold">
                                  {Math.round(weekData.reduce((acc, day) => acc + day.temp.day, 0) / weekData.length)}°C
                                </div>
                              </div>
                              <div className="bg-white/5 rounded-xl p-3 text-center">
                                <div className="text-white/70 text-sm">Max Temp</div>
                                <div className="text-white font-bold">
                                  {Math.round(Math.max(...weekData.map(day => day.temp.max)))}°C
                                </div>
                              </div>
                              <div className="bg-white/5 rounded-xl p-3 text-center">
                                <div className="text-white/70 text-sm">Min Temp</div>
                                <div className="text-white font-bold">
                                  {Math.round(Math.min(...weekData.map(day => day.temp.min)))}°C
                                </div>
                              </div>
                              <div className="bg-white/5 rounded-xl p-3 text-center">
                                <div className="text-white/70 text-sm">Avg Humidity</div>
                                <div className="text-white font-bold">
                                  {Math.round(weekData.reduce((acc, day) => acc + day.humidity, 0) / weekData.length)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📊</div>
                      <div className="text-white/70 text-lg">Loading monthly forecast...</div>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50 mx-auto mt-4"></div>
                    </div>
                  )}
                </div>
              )}

              {/* Map View - Fixed overlapping */}
              {activeTab === 'map' && (
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                    <span>🗺️</span>
                    <span>Interactive Weather Map</span>
                  </h3>
                  <div ref={mapRef} className="h-[600px] rounded-2xl overflow-hidden">
                    {/* Map will be initialized here with no overlapping elements */}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-white/60 text-sm">
                      Use the controls on the map to switch between temperature, precipitation, clouds, and wind layers.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 text-center">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
              <p className="text-white/60">
                Weather data provided by OpenWeatherMap • Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}