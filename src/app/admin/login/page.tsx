"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      const authResponse = await fetch("/admin/auth", {
        method: "GET",
        cache: "no-store",
      })

      if (!authResponse.ok) {
        await supabase.auth.signOut()

        if (authResponse.status === 403) {
          toast.error("No tienes permisos para acceder al panel de administración")
        } else {
          toast.error("No se pudo validar tu acceso al panel")
        }
        return
      }

      router.push("/admin/dashboard")
    } catch {
      toast.error("Error de red. Inténtalo nuevamente")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-20 space-y-4">
      <h1 className="text-2xl font-bold">Admin Login</h1>

      <input
        type="email"
        placeholder="Email"
        className="w-full border border-brand-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-200"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full border border-brand-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-200"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !loading) {
            handleLogin()
          }
        }}
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-brand-700 hover:bg-brand-800 text-white p-2 rounded transition disabled:opacity-70"
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
    </div>
  )
}
