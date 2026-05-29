import {useState} from 'react'
import {useShallow} from 'zustand/react/shallow'
import useStore from '@/store'

type Tab = 'login' | 'register'

/**
 * Authentication page component that provides both login and registration forms.
 * It manages the local state for the active tab (login/register) and form inputs,
 * and interacts with the global store to perform authentication actions and display errors.
 *
 * @returns The login/registration page component.
 */
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

      <div className="w-8/12 h-screen bg-white flex items-center shadow-2xl justify-center">

        <div className="bg-white rounded-3xl w-full max-w-sm p-8">
          <div className="flex items-center text-md justify-center mb-10">{tab === 'login' ? 'Welcome back to Leinwand!' : 'Welcome to Leinwand!'}</div>

          {/* Tabs */}
          <div className="flex rounded-lg bg-neutral-200 p-1 mb-5">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
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
              <label className="block text-xs font-medium px-1 text-neutral-600 mb-0.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full px-3 py-2 ring-1 ring-neutral-200 rounded-lg text-xs text-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-400"
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
                className="w-full px-3 py-2 ring-1 ring-neutral-200 rounded-lg text-xs text-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
            </div>

            {authError && (
              <p className="text-xs text-red-500">{authError}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-neutral-200 text-neutral-600 text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {loading ? '...' : tab === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
