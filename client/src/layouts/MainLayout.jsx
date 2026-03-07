import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X, LogOut } from 'lucide-react';

const MainLayout = ({ children, activeTab, setActiveTab, username, onEditUsername, counts, onLogout }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-[100dvh] w-full bg-[#0a0a0a] overflow-hidden text-gray-200 font-sans relative selection:bg-purple-500/30">

            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0 overflow-hidden bg-slate-950">
                <div className="absolute top-[-20%] right-[10%] w-[60%] h-[60%] bg-emerald-700/30 rounded-full blur-[150px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-teal-800/40 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-indigo-900/40 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '3s' }}></div>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Glass Sidebar Container */}
            <div className={`
                fixed md:relative z-50 h-full backdrop-blur-xl bg-[#0a0a0a]/90 md:bg-black/40 border-r border-white/5 
                transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                w-72 md:w-auto
            `}>
                {isMobileMenuOpen && (
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 rounded-full"
                    >
                        <X size={20} />
                    </button>
                )}
                <Sidebar
                    activeTab={activeTab}
                    setActiveTab={(tab) => {
                        setActiveTab(tab);
                        setIsMobileMenuOpen(false); // Close menu on mobile after selection
                    }}
                    username={username}
                    onEditUsername={onEditUsername}
                    counts={counts}
                />
            </div>

            <main className="flex-1 h-full overflow-hidden flex flex-col relative z-10">

                {/* Persistent Header with Glass Effect */}
                <div className="w-full p-4 md:p-6 border-b border-white/5 bg-black/20 backdrop-blur-md z-30 flex justify-between items-center sticky top-0">
                    <div className="flex items-center gap-3">
                        <button
                            className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                Welcome, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">@{username || 'User'}</span>
                            </h1>
                            <p className="text-[10px] md:text-xs text-gray-500 font-medium tracking-wider uppercase mt-0.5 md:mt-1">
                                Daily Dashboard
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="text-xs md:text-sm font-medium text-gray-400 bg-white/5 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/5 shadow-sm">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                        {username && (
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-2 text-xs md:text-sm font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/30 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-red-500/20 transition-all shadow-sm shadow-red-900/10"
                            >
                                <LogOut size={16} />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 p-4 md:p-8 overflow-x-hidden overflow-y-auto custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto h-full pb-20 md:pb-0">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
