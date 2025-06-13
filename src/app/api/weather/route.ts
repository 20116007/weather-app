// src/app/api/weather/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    
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

    // Fetch current weather data
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    )

    if (!weatherResponse.ok) {
      if (weatherResponse.status === 404) {
        return NextResponse.json(
          { error: "City not found" }, 
          { status: 404 }
        )
      }
      throw new Error(`Weather API error: ${weatherResponse.status}`)
    }

    const weatherData = await weatherResponse.json()

    // Format the response to match our interface
    const formattedData = {
      name: weatherData.name,
      main: {
        temp: Math.round(weatherData.main.temp),
        humidity: weatherData.main.humidity,
        feels_like: Math.round(weatherData.main.feels_like),
        pressure: weatherData.main.pressure
      },
      weather: weatherData.weather,
      wind: {
        speed: weatherData.wind.speed,
        deg: weatherData.wind.deg || 0
      },
      visibility: weatherData.visibility || 10000,
      clouds: {
        all: weatherData.clouds?.all || 0
      },
      coord: {
        lat: weatherData.coord.lat,
        lon: weatherData.coord.lon
      }
    }

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch weather data" }, 
      { status: 500 }
    )
  }
}