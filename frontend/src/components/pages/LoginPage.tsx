import {useState} from 'react'
import {useShallow} from 'zustand/react/shallow'
import useStore from '@/store'

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
    <div
      className="min-h-screen flex items-start justify-start"
      style={{backgroundImage: 'url(\'static/login.png\')', backgroundSize: 'cover', backgroundPosition: 'left'}}
    >


      <div className="w-9/12 h-screen bg-neutral-100 flex items-center shadow-2xl justify-center">

        <div style={{position: "absolute", top: 20, left: 10}}>
          <h1 className="text-neutral-600 text-xl text-shadow-xs font-bold px-5">LEINWAND</h1>
        </div>

        <div className="rounded-3xl w-full max-w-sm p-8">
          <div
            className="flex items-center text-lg font-semibold tracking-wide justify-center mb-10">{tab === 'login' ? 'Welcome back to Leinwand!' : 'Welcome to Leinwand!'}</div>

          {/* Tabs */}
          <div className="flex rounded-full bg-neutral-300 p-1 mb-5">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 py-1.5 text-sm font-semibold rounded-full transition-colors cursor-pointer ${
                  tab === t
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-700'
                }`}
              >
                {t === 'login' ? 'Log in' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium px-1 text-neutral-600 mb-0.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full bg-white px-3 py-2 ring-2 ring-neutral-200 rounded-full text-sm text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium px-1 text-neutral-600 mb-0.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                className="w-full bg-white px-3 py-2 ring-2 ring-neutral-200 rounded-full text-sm text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-300"
              />
            </div>

            {authError && (
              <p className="text-xs text-red-500">{authError}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-neutral-300 text-neutral-600 text-sm font-semibold rounded-full hover:bg-neutral-300 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {loading ? '...' : tab === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
