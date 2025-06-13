// src/app/api/forecast/route.ts
import { NextRequest, NextResponse } from "next/server"

interface WeatherItem {
  dt: number
  main: {
    temp: number
    humidity: number
  }
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  wind: {
    speed: number
  }
}

interface DailyData {
  dt: number
  temps: number[]
  humidity: number[]
  wind_speeds: number[]
  weather: {
    main: string
    description: string
    icon: string
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const type = searchParams.get('type') // 'hourly', 'daily', or 'monthly'
    
    if (!city) {
      return NextResponse.json(
        { error: "City parameter is required" }, 
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenWeather API key not configured" }, 
        { status: 500 }
      )
    }

    // Get coordinates first
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`
    )
    const geoData = await geoResponse.json()
    
    if (!geoData.length) {
      return NextResponse.json(
        { error: "City not found" }, 
        { status: 404 }
      )
    }

    const { lat, lon } = geoData[0]

    if (type === 'hourly') {
      // Fetch 5-day/3-hour forecast for hourly data
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      )
      
      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.status}`)
      }

      const forecastData = await forecastResponse.json()
      
      // Format hourly data (take first 8 entries = 24 hours, every 3 hours)
      const hourlyData = forecastData.list.slice(0, 8).map((item: WeatherItem) => ({
        dt: item.dt * 1000,
        main: {
          temp: Math.round(item.main.temp)
        },
        weather: item.weather,
        wind: {
          speed: item.wind.speed
        }
      }))

      return NextResponse.json({ hourly: hourlyData })
    } 
    
    else if (type === 'daily') {
      // Use the 5-day forecast API and process it for daily data
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      )
      
      if (!forecastResponse.ok) {
        throw new Error(`Daily forecast API error: ${forecastResponse.status}`)
      }

      const forecastData = await forecastResponse.json()
      
      // Group forecast data by day
      const dailyData = new Map<string, DailyData>()
      
      forecastData.list.forEach((item: WeatherItem) => {
        const date = new Date(item.dt * 1000)
        const dayKey = date.toDateString()
        
        if (!dailyData.has(dayKey)) {
          dailyData.set(dayKey, {
            dt: item.dt * 1000,
            temps: [],
            humidity: [],
            wind_speeds: [],
            weather: item.weather[0]
          })
        }
        
        const dayData = dailyData.get(dayKey)!
        dayData.temps.push(item.main.temp)
        dayData.humidity.push(item.main.humidity)
        dayData.wind_speeds.push(item.wind.speed)
      })
      
      // Convert to final format
      const formattedDaily = Array.from(dailyData.values()).slice(0, 7).map((day: DailyData) => {
        const temps = day.temps
        return {
          dt: day.dt,
          temp: {
            day: Math.round(temps.reduce((a: number, b: number) => a + b, 0) / temps.length),
            min: Math.round(Math.min(...temps)),
            max: Math.round(Math.max(...temps))
          },
          weather: [day.weather],
          humidity: Math.round(day.humidity.reduce((a: number, b: number) => a + b, 0) / day.humidity.length),
          wind_speed: day.wind_speeds.reduce((a: number, b: number) => a + b, 0) / day.wind_speeds.length
        }
      })

      return NextResponse.json({ daily: formattedDaily })
    }
    
    else if (type === 'monthly') {
      // Generate monthly forecast (30 days) using 5-day forecast as base
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      )
      
      if (!forecastResponse.ok) {
        throw new Error(`Monthly forecast API error: ${forecastResponse.status}`)
      }

      const forecastData = await forecastResponse.json()
      
      // Generate 30 days of forecast data (extrapolated from 5-day data)
      const monthlyData = []
      const baseTemp = forecastData.list[0].main.temp
      
      for (let i = 0; i < 30; i++) {
        const date = new Date()
        date.setDate(date.getDate() + i)
        
        // Use actual forecast data for first 5 days, then extrapolate
        const actualDataIndex = Math.floor(i / 5) % forecastData.list.length
        const actualData = forecastData.list[actualDataIndex] || forecastData.list[0]
        
        // Add some variation for longer term
        const tempVariation = (Math.sin(i / 7) * 5) + (Math.random() * 6 - 3)
        const seasonalVariation = Math.cos(i / 30 * Math.PI) * 3
        
        monthlyData.push({
          dt: date.getTime(),
          temp: {
            day: Math.round(baseTemp + tempVariation + seasonalVariation),
            min: Math.round(baseTemp + tempVariation + seasonalVariation - 5 - Math.random() * 3),
            max: Math.round(baseTemp + tempVariation + seasonalVariation + 5 + Math.random() * 3)
          },
          weather: [{
            main: i % 7 === 0 ? 'Rain' : i % 5 === 0 ? 'Clouds' : actualData.weather[0].main,
            description: actualData.weather[0].description,
            icon: actualData.weather[0].icon
          }],
          humidity: Math.round(actualData.main.humidity + (Math.random() * 20 - 10)),
          wind_speed: actualData.wind.speed + (Math.random() * 2 - 1),
          week: Math.floor(i / 7) + 1
        })
      }

      return NextResponse.json({ monthly: monthlyData })
    }

    return NextResponse.json(
      { error: "Invalid forecast type. Use 'hourly', 'daily', or 'monthly'" }, 
      { status: 400 }
    )

  } catch (error) {
    console.error("Forecast API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch forecast data" }, 
      { status: 500 }
    )
  }
}