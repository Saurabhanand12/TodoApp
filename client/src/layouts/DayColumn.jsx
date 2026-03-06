
import React from 'react';
import TaskCard from './TaskCard';
import { Plus, User, Briefcase, ShoppingCart } from 'lucide-react';

const CATEGORIES = [
    { value: 'personal', label: 'Personal', icon: <User size={14} />, color: 'text-blue-400' },
    { value: 'work', label: 'Work', icon: <Briefcase size={14} />, color: 'text-orange-400' },
    { value: 'grocery', label: 'Grocery', icon: <ShoppingCart size={14} />, color: 'text-emerald-400' },
];

const DayColumn = ({ title, date, tasks, onAddTask, onToggleComplete, onToggleImportant, onDelete, hideHeader = false, defaultCategory = 'personal' }) => {
    const [isAdding, setIsAdding] = React.useState(false);
    const [newTaskText, setNewTaskText] = React.useState('');
    const [selectedCategory, setSelectedCategory] = React.useState(defaultCategory);

    // Reset category when defaultCategory changes (tab switch)
    React.useEffect(() => {
        setSelectedCategory(defaultCategory);
    }, [defaultCategory]);

    const handleAdd = () => {
        if (newTaskText.trim()) {
            onAddTask(newTaskText, selectedCategory);
            setNewTaskText('');
            setIsAdding(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleAdd();
        if (e.key === 'Escape') {
            setIsAdding(false);
            setNewTaskText('');
        }
    };

    return (
        <div className="flex-1 min-w-[300px] h-full flex flex-col">
            {!hideHeader && (
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-white flex items-baseline gap-2">
                        {title} <span className="text-sm font-normal text-gray-500">{date}</span>
                    </h2>
                </div>
            )}

            <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar pb-20">
                {tasks.map(task => (
                    <TaskCard
                        key={task._id}
                        task={task}
                        onToggleComplete={onToggleComplete}
                        onToggleImportant={onToggleImportant}
                        onDelete={onDelete}
                    />
                ))}

                {isAdding ? (
                    <div className="bg-[#1a1a1a]/60 backdrop-blur-sm p-3 rounded-xl border border-blue-500/30 shadow-lg shadow-blue-900/10 animate-in fade-in zoom-in-95 duration-200">
                        <input
                            type="text"
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a new task..."
                            className="w-full bg-transparent text-white placeholder-gray-500 outline-none text-sm mb-3"
                            autoFocus
                        />
                        {/* Category Selector */}
                        <div className="flex items-center gap-2 mb-3">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.value}
                                    onClick={() => setSelectedCategory(cat.value)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-200 ${selectedCategory === cat.value
                                        ? `${cat.color} border-current bg-white/10`
                                        : 'text-gray-500 border-white/10 hover:border-white/20 hover:text-gray-300'
                                        }`}
                                >
                                    {cat.icon}
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsAdding(false)}
                                className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAdd}
                                className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-600/20"
                            >
                                Add Task
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full py-3 border border-dashed border-white/10 rounded-xl text-gray-500 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium mt-2 group"
                    >
                        <div className="w-5 h-5 rounded-full border border-gray-600 group-hover:border-blue-500 flex items-center justify-center transition-colors">
                            <Plus size={12} />
                        </div>
                        <span>Add Task</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default React.memo(DayColumn);
