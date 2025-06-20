import { Providers } from './providers'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Viewport meta tag for mobile responsiveness */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Weather App</title>
        <meta name="description" content="A beautiful, responsive weather app" />
        {/* You can add favicon and other meta tags here */}
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}