import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EdFlix - Family Movie Collection',
  description: 'Browse our family physical media collection',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-edflix-dark text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
