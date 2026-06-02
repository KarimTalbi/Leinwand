import {useState} from 'react'
import {useShallow} from 'zustand/react/shallow'
import useStore from '@/store'
import {cn} from "@/lib/utils.ts";
import {background, bgColor, buttonStyle, foreground, ring, text} from "@/lib/styles.ts";
import {LogIn, UserRoundPlus} from "lucide-react";

type Tab = 'login' | 'register'

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const {login, register, authError, clearAuthError} = useStore(useShallow((s) => ({
    login: s.login,
    register: s.register,
    authError: s.authError,
    clearAuthError: s.clearAuthError,
  })))

  const handleSubmit = async (event: { preventDefault(): void }) => {
    event.preventDefault()
    setLoading(true)
    if (tab === 'login') {
      await login(username, password)
    } else {
      await register(username, password)
    }
    setLoading(false)
  }

  const switchTab = (t: Tab) => {
    setTab(t)
    clearAuthError()
    setUsername('')
    setPassword('')
  }

  return (
    <div className={cn(bgColor, ring, text, "rounded-3xl")}>
      <div className="flex flex-col p-6 gap-1">

        {/* Tabs */}
        <div className={cn("flex flex-row rounded-full p-1 mb-5", foreground, ring)}>
          {(['login', 'register'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                tab === t
                  ? cn(text, background)
                  : text
              }`}
            >
              {t === 'login' ? 'Log in' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium px-1 mb-0.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className={cn("w-full px-3 py-1.5 rounded-full text-sm focus:outline-none", foreground, ring)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium px-1  mb-0.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              className={cn("w-full px-3 py-1.5 rounded-full text-sm focus:outline-none", foreground, ring)}
            />
          </div>

          {authError && (
            <p className="text-xs text-red-500">{authError}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(buttonStyle, "rounded-full w-full btn-sm mt-1")}
          >
            {loading ? '...' : tab === 'login'
              ? <div className="flex flex-row items-center gap-2"><LogIn size={16}/><p>Login</p></div>
              : <div className="flex flex-row items-center gap-2"><UserRoundPlus size={16}/><p>Create Account</p></div>
            }
          </button>
        </form>
      </div>
    </div>
  )
}
