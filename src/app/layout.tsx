import type React from "react"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/lib/auth-context"

// Geist Sans for UI/body; Geist Mono reserved for tabular data (stats, counts,
// dates) via the `.tabular` utility — a deliberate pairing for a data tool.
// The `geist` package exposes `.variable` for CSS custom properties.

export const metadata = {
  title: "Folyo — Build and manage your portfolio",
  description: "Folyo is a portfolio CMS where you bring your own storage and manage your content from one dashboard.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}

