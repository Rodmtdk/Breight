import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { E2EKeySync } from '@/components/e2e-key-sync'
import { SystemLanguage } from '@/components/system-language'
import { CallProvider } from '@/components/chat/call-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'BR8',
  description: 'BR8 : caméra, stories, messages, amis et appels vidéo dans une interface simple.',
  generator: 'v0.app',
  applicationName: 'BR8',
  keywords: ['BR8', 'communauté', 'projets', 'entreprises', 'annonces', 'stories'],
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: '#242538',
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
            <SystemLanguage />
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
