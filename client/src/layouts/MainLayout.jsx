
import React from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children, activeTab, setActiveTab, userName }) => {
    return (
        <div className="flex h-screen w-full bg-[#0a0a0a] overflow-hidden text-gray-200 font-sans relative selection:bg-purple-500/30">

            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
                <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-indigo-900/10 rounded-full blur-[100px] animate-ping-slow"></div>
            </div>

            {/* Glass Sidebar Container */}
            <div className="relative z-20 h-full backdrop-blur-xl bg-black/40 border-r border-white/5">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            <main className="flex-1 h-full overflow-hidden flex flex-col relative z-10">

                {/* Persistent Header with Glass Effect */}
                <div className="w-full p-6 border-b border-white/5 bg-black/20 backdrop-blur-md z-30 flex justify-between items-center sticky top-0">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            {userName}
                        </h1>
                        <p className="text-xs text-gray-500 font-medium tracking-wider uppercase mt-1">
                            Daily Dashboard
                        </p>
                    </div>

                    <div className="text-sm font-medium text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5 shadow-sm">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                <div className="flex-1 p-8 overflow-x-auto overflow-y-auto custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto h-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MainLayout;

