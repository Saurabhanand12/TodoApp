import React from 'react';

const CategoryFilterDropdown = ({ options, activeFilter, onFilterChange }) => {
    return (
        <div className="flex flex-wrap items-center gap-3 mb-8">
            {options.map((opt) => {
                const isActive = (activeFilter === 'all' && opt.id === 'all-tasks') || activeFilter === opt.filter;
                return (
                    <button
                        key={opt.id}
                        onClick={() => onFilterChange(opt.id === 'all-tasks' ? 'all' : opt.filter)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 transform active:scale-95 ${isActive
                            ? `${opt.color} bg-white/10 ring-1 ring-white/20 shadow-lg shadow-black/20`
                            : 'text-gray-400 bg-[#151515] hover:bg-[#1e1e1e] hover:text-gray-200 border border-white/5 hover:border-white/10'
                            }`}
                    >
                        {React.cloneElement(opt.icon, { size: 18, className: isActive ? 'drop-shadow-md' : '' })}
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
};

export default React.memo(CategoryFilterDropdown);
