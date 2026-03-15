import React, { useState } from 'react';
import { User, X, Check, Loader2 } from 'lucide-react';
import { formatError } from '../utils/api';

const UsernameEditModal = ({ currentUsername, onSave, onCancel, loading: externalLoading }) => {
    const [newUsername, setNewUsername] = React.useState(currentUsername);
    const [error, setError] = React.useState('');
    const [localLoading, setLocalLoading] = React.useState(false);

    const loading = externalLoading || localLoading;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = newUsername.trim();
        if (!trimmed || trimmed.toLowerCase() === currentUsername.toLowerCase()) {
            onCancel();
            return;
        }

        setError('');
        setLocalLoading(true);
        try {
            await onSave(trimmed);
        } catch (err) {
            setError(formatError(err));
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onCancel} />

            {/* Modal Card */}
            <div className="relative w-full max-w-sm bg-[#0f0f0f] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-white font-bold text-lg">Change Username</h3>
                        <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative group">
                            <input
                                type="text"
                                id="edit-username"
                                value={newUsername}
                                onChange={(e) => { setNewUsername(e.target.value); setError(''); }}
                                placeholder="New Username"
                                className="peer w-full bg-white/[0.03] border border-white/10 rounded-2xl px-12 py-4 text-white placeholder-transparent text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                autoFocus
                            />
                            <label
                                htmlFor="edit-username"
                                className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 text-sm transition-all 
                                peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm 
                                peer-focus:top-3 peer-focus:text-[10px] peer-focus:text-blue-500 
                                peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[10px] 
                                peer-[:not(:placeholder-shown)]:text-blue-500 pointer-events-none font-bold uppercase tracking-widest"
                            >
                                New Username
                            </label>
                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 peer-focus:text-blue-500 transition-colors" />
                        </div>

                        {error && (
                            <p className="text-red-400 text-[11px] font-medium ml-1">{error}</p>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 py-3 rounded-xl border border-white/5 text-gray-400 font-bold text-xs hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !newUsername.trim() || newUsername.trim().toLowerCase() === currentUsername.toLowerCase()}
                                className="flex-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Save Changes</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UsernameEditModal;
