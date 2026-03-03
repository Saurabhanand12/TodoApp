import React from 'react';
import {
    LayoutDashboard,
    CalendarDays,
    CheckSquare,
    Star,
    User,
    ShoppingBag,
    Briefcase,
    Plus,
    Settings,
    Pencil
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, username, onEditUsername }) => {
    const displayName = username || 'User';
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <div className="w-64 h-full text-gray-300 p-6 flex flex-col">
            {/* App Header */}
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/20">
                    <User size={20} />
                </div>
                <div>
                    <h2 className="text-white font-bold text-3xl italic">TodoDolt</h2>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Premium</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                <NavItem
                    icon={<LayoutDashboard size={20} />}
                    label="My Day"
                    active={activeTab === 'my-day'}
                    onClick={() => setActiveTab('my-day')}
                    color="text-blue-400"
                />
                <NavItem
                    icon={<Star size={20} />}
                    label="Important"
                    active={activeTab === 'important'}
                    onClick={() => setActiveTab('important')}
                    color="text-yellow-400"
                />
                <NavItem
                    icon={<CalendarDays size={20} />}
                    label="Planned"
                    active={activeTab === 'planned'}
                    onClick={() => setActiveTab('planned')}
                    color="text-purple-400"
                />
                <NavItem
                    icon={<CheckSquare size={20} />}
                    label="All Tasks"
                    active={activeTab === 'all-tasks'}
                    onClick={() => setActiveTab('all-tasks')}
                    color="text-green-400"
                />
                <NavItem icon={<User size={20} />} label="Assigned to me" />

                <div className="pt-8 pb-2">
                    <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-4">My Lists</h3>
                    <NavItem icon={<User size={18} />} label="Personal" />
                    <NavItem icon={<Briefcase size={18} />} label="Work" />
                    <NavItem icon={<ShoppingBag size={18} />} label="Grocery List" />
                </div>
            </nav>

            {/* Add List Button */}
            <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-white/5 rounded-xl transition-all w-full text-left mt-auto mb-6 text-gray-400 hover:text-white group">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                    <Plus size={18} />
                </div>
                <span>New List</span>
            </button>

            {/* User Profile */}
            <div className="mt-auto pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 px-3 py-3 hover:bg-white/5 rounded-xl transition-all group border border-transparent hover:border-white/5">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center ring-2 ring-transparent group-hover:ring-blue-500/50 transition-all flex-shrink-0">
                        <span className="text-xs font-bold text-white">{initial}</span>
                    </div>
                    {/* Name & label */}
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">@{displayName}</h4>
                        <p className="text-[10px] text-gray-500 truncate">Pro Account</p>
                    </div>
                    {/* Edit */}
                    <button
                        id="edit-username-btn"
                        onClick={onEditUsername}
                        title="Change username"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/10"
                    >
                        <Pencil size={14} className="text-gray-400 hover:text-white transition-colors" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const NavItem = ({ icon, label, active = false, count, onClick, color }) => {
    return (
        <a
            href="#"
            onClick={(e) => {
                e.preventDefault();
                onClick && onClick();
            }}
            className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden ${active
                ? 'bg-white/10 text-white shadow-lg shadow-black/20'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
        >
            {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full"></div>}
            <div className="flex items-center gap-3 z-10">
                <span className={`transition-colors duration-200 ${active ? color : 'text-gray-500 group-hover:text-gray-300'}`}>
                    {icon}
                </span>
                <span>{label}</span>
            </div>
            {count && (
                <span className="bg-black/30 text-[10px] px-2 py-0.5 rounded-full text-gray-400 font-bold border border-white/5">
                    {count}
                </span>
            )}
        </a>
    );
};

export default Sidebar;
