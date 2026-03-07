import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Lock, Eye, EyeOff, LogIn, Shield, Cloud } from 'lucide-react';
import api from '../services/api';

export const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [serverStatus, setServerStatus] = useState<'warming' | 'ready' | null>(null);

    const { login } = useAuth();
    const navigate = useNavigate();

    // Ping the backend as soon as the login page mounts (fires on first visit AND after every logout).
    // This wakes up the Render free-tier dyno so it's warm by the time the user hits Sign In.
    useEffect(() => {
        let warmingTimer: ReturnType<typeof setTimeout>;
        warmingTimer = setTimeout(() => setServerStatus('warming'), 2000);

        api.get('/health')
            .finally(() => {
                clearTimeout(warmingTimer);
                setServerStatus('ready');
            });

        return () => clearTimeout(warmingTimer);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { username, password });
            login(response.data.token, response.data.username, response.data.role);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 md:px-10 py-3">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">Employee &amp; Family Registry</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button type="button" className="hidden md:flex items-center justify-center rounded-lg h-10 px-4 bg-primary/10 text-primary text-sm font-bold border border-primary/20">
                        System Status
                    </button>
                    <button type="button" className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold">
                        Help
                    </button>
                </div>
            </header>

            {/* Main */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
                {/* Background decorative blurs */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl opacity-60"></div>
                    <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl opacity-60"></div>
                </div>

                <div className="w-full max-w-[480px] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                    {/* Hero image section */}
                    <div className="h-40 sm:h-48 w-full bg-slate-100 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/25 to-primary/5" />
                        <div className="absolute bottom-5 left-7">
                            <div className="bg-white p-2.5 rounded-lg shadow-lg inline-block">
                                <Lock className="text-primary h-7 w-7" />
                            </div>
                        </div>
                    </div>

                    {/* Form section */}
                    <div className="p-6 sm:p-8">
                        <div className="mb-6">
                            <h1 className="text-slate-900 text-2xl sm:text-3xl font-bold leading-tight">Welcome Back</h1>
                            <p className="text-slate-500 text-sm mt-2">Please sign in to access the secure registry system</p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {serverStatus === 'warming' && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-amber-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="text-sm text-amber-700">Server is starting up, this may take a moment…</p>
                                </div>
                            )}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <label className="text-slate-700 text-sm font-semibold">Username</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none" />
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="e.g. admin"
                                        className="w-full pl-12 pr-4 h-12 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none text-sm placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-slate-700 text-sm font-semibold">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-12 h-12 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none text-sm placeholder:text-slate-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <>
                                        <span>Sign In to Dashboard</span>
                                        <LogIn className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
                            <p className="text-xs text-slate-400 text-center">
                                This is a secure system authorized for employee use only.<br />All activities are monitored and logged.
                            </p>
                            <div className="flex gap-4 text-slate-300">
                                <ShieldCheck className="h-5 w-5" />
                                <Shield className="h-5 w-5" />
                                <Cloud className="h-5 w-5" />
                            </div>
                            <div className="text-center text-xs text-slate-400 space-y-0.5">
                                <p>Demo Admin: admin / Admin@123</p>
                                <p>Demo Viewer: viewer / Viewer@123</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="p-5 text-center text-slate-400 text-xs">
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-2">
                    <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-primary transition-colors">Contact Support</a>
                </div>
                <p>© 2024 Employee &amp; Family Registry System. All rights reserved.</p>
            </footer>
        </div>
    );
};
