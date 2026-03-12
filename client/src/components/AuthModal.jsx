import React, { useState } from 'react';
import { User, Lock, Mail, Eye, EyeOff, Sparkles, LogIn, UserPlus } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthModal = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validateEmail = (mail) => {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            if (!email || !password) {
                setError('Please fill in both Email/Username and password.');
                return;
            }
        } else {
            const trimmedUsername = username.trim();
            if (!trimmedUsername || !email || !password) {
                setError('Please fill in all fields.');
                return;
            }
            if (!validateEmail(email)) {
                setError('Please provide a valid email format (e.g., user@example.com).');
                return;
            }
            if (password.length < 6) {
                setError('Password must be at least 6 characters long.');
                return;
            }
        }

        setLoading(true);

        try {
            const endpoint = isLogin ? '/api/user/login' : '/api/user/register';
            const payload = isLogin
                ? { email: email.trim().toLowerCase(), password }
                : { username: username.trim(), email: email.trim().toLowerCase(), password };


            const res = await axios.post(`${API}${endpoint}`, payload, { withCredentials: true });

            onAuthSuccess(res.data.username);
            setEmail('');
            setPassword('');
        } catch (err) {
            // Authentication error handled via UI error state
            setError(err.response?.data?.error || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setUsername('');
        setEmail('');
        setPassword('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500" />

            {/* Modal Card */}
            <div className="relative w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">

                {/* Visual accents */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600" />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-[80px]" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/20 rounded-full blur-[80px]" />

                <div className="p-8 relative z-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-6 shadow-xl shadow-purple-900/20 ring-1 ring-white/20">
                            {isLogin ? <LogIn size={28} className="text-white" /> : <UserPlus size={28} className="text-white" />}
                        </div>
                        <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight flex items-center justify-center gap-2">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                            <Sparkles size={20} className="text-yellow-400" />
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {isLogin ? 'Enter your credentials to access your dashboard.' : 'Sign up to start organizing your tasks.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                        {!isLogin && (
                            <div className="relative group animate-in slide-in-from-top-2">
                                <input
                                    type="text"
                                    id="username"
                                    name="new-username"
                                    autoComplete="new-username"
                                    value={username}
                                    onChange={(e) => { setUsername(e.target.value); setError(''); }}
                                    placeholder="Username"
                                    className="peer w-full bg-white/[0.03] border border-white/10 rounded-2xl px-12 py-5 text-white placeholder-transparent text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    autoFocus={!isLogin}
                                />
                                <label
                                    htmlFor="username"
                                    className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 text-sm transition-all 
                                    peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm 
                                    peer-focus:top-3.5 peer-focus:text-[10px] peer-focus:text-blue-500 
                                    peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:text-[10px] 
                                    peer-[:not(:placeholder-shown)]:text-blue-500 pointer-events-none font-bold uppercase tracking-widest"
                                >
                                    Username
                                </label>
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 peer-focus:text-blue-500 transition-colors" />
                            </div>
                        )}

                        <div className="relative group">
                            <input
                                type="text"
                                id="email"
                                name="new-email"
                                autoComplete="new-email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                placeholder={isLogin ? "Email or Username" : "Email"}
                                className="peer w-full bg-white/[0.03] border border-white/10 rounded-2xl px-12 py-5 text-white placeholder-transparent text-sm outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                autoFocus={isLogin}
                            />
                            <label
                                htmlFor="email"
                                className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 text-sm transition-all 
                                peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm 
                                peer-focus:top-3.5 peer-focus:text-[10px] peer-focus:text-emerald-500 
                                peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:text-[10px] 
                                peer-[:not(:placeholder-shown)]:text-emerald-500 pointer-events-none font-bold uppercase tracking-widest"
                            >
                                {isLogin ? 'Email or Username' : 'Email'}
                            </label>
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 peer-focus:text-emerald-500 transition-colors" />
                        </div>

                        <div className="relative group">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="new-password"
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                placeholder="Password"
                                className="peer w-full bg-white/[0.03] border border-white/10 rounded-2xl px-12 py-5 text-white placeholder-transparent text-sm outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all"
                            />
                            <label
                                htmlFor="password"
                                className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 text-sm transition-all 
                                peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm 
                                peer-focus:top-3.5 peer-focus:text-[10px] peer-focus:text-purple-500 
                                peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:text-[10px] 
                                peer-[:not(:placeholder-shown)]:text-purple-500 pointer-events-none font-bold uppercase tracking-widest"
                            >
                                Password
                            </label>
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 peer-focus:text-purple-500 transition-colors" />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                                <span className="text-red-500 mt-0.5">⚠️</span>
                                <p className="text-red-400 text-xs font-medium leading-relaxed">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-xl shadow-blue-900/40 disabled:opacity-50 disabled:scale-100 active:scale-95 flex items-center justify-center gap-2 group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-20deg]" />
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Login' : 'Register'}
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={toggleMode}
                            className="text-gray-400 text-sm hover:text-white transition-colors"
                        >
                            {isLogin ? (
                                <>Don't have an account? <span className="text-blue-400 font-bold">Register</span></>
                            ) : (
                                <>Already have an account? <span className="text-blue-400 font-bold">Login</span></>
                            )}
                        </button>
                    </div>
                </div>

                <div className="p-6 bg-white/[0.02] border-t border-white/5 text-center">
                    <p className="text-xs text-gray-500">
                        Securely encrypted by TodoDolt Auth Engine
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
