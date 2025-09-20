"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/Button"
//import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface LoginFormProps {
  onSuccess?: () => void
  redirectTo?: string
  className?: string
}

export default function LoginForm({ onSuccess, redirectTo = "/", className = "" }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  /*const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/`,
        },
      })
      if (error) throw error

      if (onSuccess) {
        onSuccess()
      } else {
        router.push(redirectTo)
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  } */

  return (
    <form className={`space-y-6 ${className}`}>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 py-4 px-4 text-base shadow-sm rounded-lg outline-none transition-all"
          placeholder="Enter your email"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 py-4 px-4 pr-12 text-base shadow-sm rounded-lg outline-none transition-all"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <span className="text-lg">{showPassword ? "🙈" : "👁️"}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
          <span className="ml-2 text-sm text-slate-600">Remember me</span>
        </label>
        <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Forgot password?
        </a>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 text-base shadow-lg rounded-lg flex items-center justify-center gap-2"
        disabled={!email.trim() || !password.trim() || isLoading}
      >
        {isLoading ? "Signing In..." : "Sign In"}
        <span className="text-lg">→</span>
      </Button>
    </form>
  )
}