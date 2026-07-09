import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist_Mono } from 'next/font/google'
import { E2EKeySync } from '@/components/e2e-key-sync'
import './globals.css'

const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'BREIGHT — Écoute profonde, connexion vraie',
  description:
    "BREIGHT transforme la communication classique en méthode psychologique d'écoute. Messagerie chiffrée E2E, découverte d'amis, empathie en direct.",
  generator: 'v0.app',
  other: {
    'x-version': 'v1.0-production',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fbfcfe',
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
    <html lang="fr" className="bg-background">
      <body className={`${geistMono.variable} font-sans antialiased`}>
        <E2EKeySync />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
