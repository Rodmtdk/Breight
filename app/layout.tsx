import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { E2EKeySync } from '@/components/e2e-key-sync'
import { CallProvider } from '@/components/chat/call-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Breight',
  description: 'Caméra, stories, messages et carte. Un réseau simple, avec une vraie navigation.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: '#111111',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="bg-background" suppressHydrationWarning>
      <body className={`${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <CallProvider>
            <E2EKeySync />
            {children}
          </CallProvider>
          <Toaster />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
