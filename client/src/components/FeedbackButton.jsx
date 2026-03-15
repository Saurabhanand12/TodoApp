import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { API, api, formatError } from '../utils/api';
import logger from '../utils/logger';

const FeedbackButton = ({ username }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [selectedRating, setSelectedRating] = React.useState(null);
    const [status, setStatus] = React.useState('idle'); // idle, rating, loading, success, error
    const [errorMsg, setErrorMsg] = React.useState('');
    const [hasAlreadySubmitted, setHasAlreadySubmitted] = React.useState(false);

    const RATING_FACES = [
        { value: 1, emoji: '😠', label: 'Terrible' },
        { value: 2, emoji: '😕', label: 'Bad' },
        { value: 3, emoji: '😐', label: 'Okay' },
        { value: 4, emoji: '🙂', label: 'Good' },
        { value: 5, emoji: '🤩', label: 'Awesome' }
    ];

    // Filter out restricted names from the persistent check if needed, 
    // but usually we want to check for everyone
    React.useEffect(() => {
        const checkFeedbackStatus = async () => {
            if (!username) return;
            try {
                const res = await api.get(`/api/feedback/check/${username}`);
                if (res.data.hasSubmitted) {
                    setHasAlreadySubmitted(true);
                }
            } catch (err) {
                logger.error('Error checking feedback status:', err);
            }
        };
        checkFeedbackStatus();
    }, [username]);

    // Trigger feedback prompt after 1 minute (once per session)
    React.useEffect(() => {
        if (hasAlreadySubmitted) return;

        const hasPrompted = sessionStorage.getItem('feedback_prompted');
        if (!hasPrompted) {
            const timer = setTimeout(() => {
                setIsOpen(true);
                sessionStorage.setItem('feedback_prompted', 'true');
            }, 60000); // 1 minute
            return () => clearTimeout(timer);
        }
    }, [hasAlreadySubmitted]);

    const handleFirstStep = (e) => {
        e.preventDefault();
        const trimmedMessage = message.trim();
        if (!trimmedMessage) return;
        setStatus('rating');
    };

    const submitFeedback = async (ratingValue) => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage) return;

        setSelectedRating(ratingValue);
        setStatus('loading');

        try {
            await api.post('/api/feedback', {
                username: username || 'anonymous',
                message: trimmedMessage,
                rating: ratingValue
            });

            setStatus('success');
            setTimeout(() => {
                setIsOpen(false);
                setHasAlreadySubmitted(true); // Hide persistently now
                setTimeout(() => {
                    setMessage('');
                    setSelectedRating(null);
                    setStatus('idle');
                }, 300); // Wait for modal close animation
            }, 3000); // Wait a bit longer so they see the success message

        } catch (err) {
            setStatus('error');
            setErrorMsg(formatError(err));
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

            {/* Feedback Popover */}
            {isOpen && (
                <div className="mb-4 w-80 bg-[#151515] border border-white/10 rounded-2xl shadow-2xl shadow-black p-5 animate-in slide-in-from-bottom-5 fade-in duration-200 ring-1 ring-blue-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold text-sm tracking-wide">
                            {status === 'rating' ? 'Rate your experience' : 'How is your experience?'}
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {status === 'success' ? (
                        <div className="py-6 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
                            <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-3">
                                <Send size={20} />
                            </div>
                            <p className="text-white font-medium text-sm">Thank you!</p>
                            <p className="text-gray-400 text-xs mt-1">Your feedback has been sent directly to us.</p>
                        </div>
                    ) : status === 'rating' || status === 'loading' ? (
                        <div className="py-2 flex flex-col items-center justify-center animate-in slide-in-from-right-4 duration-300">
                            <p className="text-gray-400 text-xs mb-6 text-center">
                                Please rate your overall experience so far to help us improve.
                            </p>

                            <div className="flex justify-between w-full px-2 mb-4">
                                {RATING_FACES.map((item) => (
                                    <button
                                        key={item.value}
                                        onClick={() => submitFeedback(item.value)}
                                        disabled={status === 'loading'}
                                        className={`flex flex-col items-center gap-1 group transition-all duration-200 ${status === 'loading' ? 'opacity-50 cursor-not-allowed' : 'hover:scale-125 hover:-translate-y-1'} ${selectedRating === item.value ? 'scale-125 -translate-y-1' : ''}`}
                                    >
                                        <span className="text-3xl filter drop-shadow-md grayscale-[50%] group-hover:grayscale-0 transition-all duration-200">
                                            {item.emoji}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {status === 'loading' && (
                                <div className="flex items-center gap-2 mt-4 text-xs font-medium text-blue-400 animate-pulse">
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Sending Feedback...</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleFirstStep} className="flex flex-col gap-3 animate-in fade-in duration-300">
                            <textarea
                                value={message}
                                onChange={(e) => {
                                    setMessage(e.target.value);
                                    if (status === 'error') setStatus('idle');
                                }}
                                placeholder="Tell us what you love, what to improve, or report a bug..."
                                className="w-full h-28 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none custom-scrollbar"
                                autoFocus
                            />

                            {status === 'error' && (
                                <p className="text-red-400 text-xs font-medium">{errorMsg}</p>
                            )}

                            <div className="flex justify-end mt-1">
                                <button
                                    type="submit"
                                    disabled={!message.trim()}
                                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 active:scale-95 group"
                                >
                                    Next <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Floating Trigger Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group flex items-center justify-center w-12 h-12 bg-[#1e1e1e] border border-white/10 hover:border-blue-500/50 rounded-full shadow-lg shadow-black/80 text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-105 active:scale-95"
                    title="Send Feedback"
                >
                    <MessageSquare size={20} className="group-hover:animate-pulse" />
                </button>
            )}
        </div>
    );
};

export default FeedbackButton;
