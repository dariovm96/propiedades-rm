import "./globals.css"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ToasterProvider from "../components/ToasterProvider"
import ScrollToTopButton from "@/components/ScrollToTopButton"
import RouteScrollReset from "@/components/RouteScrollReset"

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
    <html lang="es" className="overflow-x-hidden scroll-smooth">
      <body suppressHydrationWarning className="bg-brand-50 text-brand-900 min-h-screen flex flex-col overflow-x-hidden">
        <RouteScrollReset />
        <Header />

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pt-[calc(4.5rem+2rem)] sm:pt-[calc(4.5rem+2.5rem)] pb-8 sm:pb-10">
          {children}
        </main>

        <Footer />
        <ScrollToTopButton />
        <ToasterProvider />
      </body>
    </html>
  )
}
