import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Clock, User, Star } from 'lucide-react';
import logger from '../utils/logger';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const RATING_FACES = {
    1: '😠',
    2: '😕',
    3: '😐',
    4: '🙂',
    5: '🤩'
};

const AdminFeedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFeedback = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/api/feedback`);
            setFeedbacks(res.data);
        } catch (err) {
            logger.error("Error fetching feedback:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="max-w-6xl mx-auto w-full flex flex-col h-full animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-900/20">
                    <MessageSquare size={24} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white">User Feedback</h2>
                    <p className="text-sm text-gray-400 mt-1">Review bug reports and feature requests from users</p>
                </div>

                <div className="ml-auto flex items-center gap-4">
                    <button
                        onClick={fetchFeedback}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 hover:text-white transition-all group"
                        title="Refresh Feedback"
                    >
                        <div className={`transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
                        </div>
                        <span className="text-sm font-medium">Refresh</span>
                    </button>

                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3">
                        <span className="text-gray-400 text-sm">Total:</span>
                        <span className="text-white font-bold text-xl">{feedbacks.length}</span>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col bg-[#111] border border-white/5 rounded-2xl shadow-xl shadow-black/40">
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500 text-sm">Loading feedback records...</p>
                    </div>
                ) : feedbacks.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
                        <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center border border-white/5 mb-2">
                            <MessageSquare size={32} className="text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white">No feedback yet</h3>
                        <p className="text-gray-400 max-w-sm">When users submit feedback through the widget, it will appear here.</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-md z-10 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">User</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">Message</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest text-center">Rating</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {feedbacks.map((item) => (
                                    <tr key={item._id} className="hover:bg-white/[0.02] transition-colors group">

                                        {/* User Column */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400">
                                                    <User size={14} />
                                                </div>
                                                <span className="font-medium text-gray-200">
                                                    @{item.username === 'anonymous' ? <span className="text-gray-500 italic">anonymous</span> : item.username}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Message Column */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-300 whitespace-pre-wrap max-w-2xl leading-relaxed">
                                                {item.message}
                                            </p>
                                        </td>

                                        {/* Rating Column */}
                                        <td className="px-6 py-4 text-center">
                                            {item.rating ? (
                                                <div className="flex flex-col items-center gap-1.5" title={`${item.rating} out of 5 stars`}>
                                                    <span className="text-2xl filter drop-shadow hover:scale-110 transition-transform cursor-help">
                                                        {RATING_FACES[item.rating]}
                                                    </span>
                                                    <div className="flex gap-0.5 text-rose-500/80">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={10} fill={i < item.rating ? "currentColor" : "transparent"} strokeWidth={i < item.rating ? 0 : 2} className={i < item.rating ? '' : 'text-gray-700'} />
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-600 text-xs italic">N/A</span>
                                            )}
                                        </td>

                                        {/* Date Column */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2 text-sm text-gray-500">
                                                <Clock size={14} />
                                                <span>{formatDate(item.createdAt)}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminFeedback;
