import {useState} from 'react';
import {useShallow} from 'zustand/react/shallow';
import useStore from '@/store';

type Tab = 'login' | 'register';

export default function LoginPage() {
    const [tab, setTab] = useState<Tab>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const {login, register, authError, clearAuthError} = useStore(useShallow((s) => ({
        login: s.login,
        register: s.register,
        authError: s.authError,
        clearAuthError: s.clearAuthError,
    })));

    const handleSubmit = async (event: {preventDefault(): void}) => {
        event.preventDefault();
        setLoading(true);
        if (tab === 'login') {
            await login(username, password);
        } else {
            await register(username, password);
        }
        setLoading(false);
    };

    const switchTab = (t: Tab) => {
        setTab(t);
        clearAuthError();
        setUsername('');
        setPassword('');
    };

    return (
        <div
          className="min-h-screen flex items-start justify-start"
          style={{backgroundImage: "url('static/login.png')", backgroundSize: 'cover', backgroundPosition: 'left'}}
        >

            <div className="w-8/12 h-screen bg-white flex items-center shadow-2xl justify-center">

            <div className="bg-white rounded-3xl w-full max-w-sm p-8">
                <div className="flex items-center text-xl justify-center mb-10">{tab === "login" ? "Welcome back to Leinwand!" : "Welcome to Leinwand!"}</div>

                {/* Tabs */}
                <div className="flex rounded-full bg-gray-100 p-1 mb-6">
                    {(['login', 'register'] as Tab[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => switchTab(t)}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer ${
                                tab === t
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {t === 'login' ? 'Log in' : 'Register'}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium px-1 text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium px-1 text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                        />
                    </div>

                    {authError && (
                        <p className="text-sm text-red-500">{authError}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                        {loading ? '...' : tab === 'login' ? 'Log in' : 'Create account'}
                    </button>
                </form>
            </div>
            </div>
        </div>
    );
}
