import React, { useState } from 'react';
import { User, Sparkles } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const UsernameModal = ({ onUsernameSet }) => {
    const [inputValue, setInputValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = inputValue.trim();
        if (!trimmed) {
            setError('Please enter a username.');
            return;
        }
        if (!passwordValue) {
            setError('Please enter a password.');
            return;
        }
        if (trimmed.length < 2) {
            setError('Username must be at least 2 characters.');
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
            setError('Only letters, numbers and underscores allowed.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await axios.post(`${API}/api/user`, { username: trimmed, password: passwordValue });
            localStorage.setItem('username', trimmed.toLowerCase());
            onUsernameSet(trimmed.toLowerCase());
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

            {/* Modal Card */}
            <div className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 p-8 animate-modal-in">

                {/* Glow accent */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-56 h-56 bg-purple-600/20 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute -bottom-20 right-0 w-40 h-40 bg-blue-600/20 rounded-full blur-[70px] pointer-events-none" />

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/40">
                        <User size={28} className="text-white" />
                    </div>
                </div>

                {/* Text */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                        Welcome to TodoDolt
                        <Sparkles size={20} className="text-yellow-400" />
                    </h2>
                    <p className="text-sm text-gray-400">
                        Enter a username and password to get started. Your tasks are securely saved to your account.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                            Username
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
                            <input
                                id="username-input"
                                type="text"
                                value={inputValue}
                                onChange={(e) => { setInputValue(e.target.value); setError(''); }}
                                placeholder="your_username"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 pl-8 py-3 text-white placeholder-gray-600 text-sm outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                autoFocus
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 mt-4">
                            Password
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔒</span>
                            <input
                                id="password-input"
                                type="password"
                                value={passwordValue}
                                onChange={(e) => { setPasswordValue(e.target.value); setError(''); }}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 pl-9 py-3 text-white placeholder-gray-600 text-sm outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
                            />
                        </div>
                        {error && (
                            <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                                <span>⚠</span> {error}
                            </p>
                        )}
                    </div>

                    <button
                        id="username-submit-btn"
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-sm hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg shadow-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                        {loading ? 'Setting up...' : 'Get Started →'}
                    </button>
                </form>

                <p className="text-center text-xs text-gray-600 mt-6">
                    Log in with existing credientials or register a new one.
                </p>
            </div>
        </div>
    );
};

export default UsernameModal;
