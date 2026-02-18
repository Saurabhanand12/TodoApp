
import React from 'react';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

const DayColumn = ({ title, date, tasks, onAddTask, onToggleComplete, onToggleImportant, onDelete, hideHeader = false }) => {
    const [isAdding, setIsAdding] = React.useState(false);
    const [newTaskText, setNewTaskText] = React.useState('');

    const handleAdd = () => {
        if (newTaskText.trim()) {
            onAddTask(newTaskText);
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

export default DayColumn;
