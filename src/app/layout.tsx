import "./globals.css"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ToasterProvider from "../components/ToasterProvider"

export const metadata = {
  title: "Propiedades RM",
  description: "Compra y arriendo directo de propiedades sin intermediarios",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="overflow-x-hidden">
      <body suppressHydrationWarning className="bg-brand-50 text-brand-900 min-h-screen flex flex-col overflow-x-hidden">
        <Header />

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
          {children}
        </main>

        <Footer />
        <ToasterProvider />
      </body>
    </html>
  )
}
