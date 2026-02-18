import React from 'react';
import { Star, Trash2 } from 'lucide-react';

const TaskCard = ({ task, onToggleComplete, onToggleImportant, onDelete }) => {
    return (
        <div className="group bg-[#1a1a1a]/60 backdrop-blur-sm p-4 rounded-xl border border-white/5 hover:border-white/10 hover:bg-[#1a1a1a]/80 transition-all duration-300 flex items-start gap-4 mb-3 shadow-lg shadow-black/10 relative hover:shadow-black/20 hover:scale-[1.005]">
            <button
                onClick={() => onToggleComplete(task._id)}
                className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${task.completed
                    ? 'bg-blue-600 border-blue-600 scale-110 shadow-lg shadow-blue-500/30'
                    : 'border-gray-600 hover:border-blue-500 hover:bg-blue-500/10'
                    }`}
            >
                {task.completed && <div className="w-2.5 h-1.5 border-b-2 border-r-2 border-white rotate-45 -mt-0.5" />}
            </button>

            <div className="flex-1 min-w-0 pt-0.5">
                <p className={`text-[15px] font-medium leading-normal break-words transition-colors duration-300 ${task.completed ? 'line-through text-gray-500 decoration-gray-600' : 'text-gray-200'}`}>
                    {task.text}
                </p>
                <div className="flex items-center gap-3 mt-2">
                    <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold bg-white/5 px-2 py-0.5 rounded border border-white/5">
                        Personal
                    </span>
                    {task.due_date && (
                        <span className="text-[11px] text-gray-500">
                            {new Date(task.due_date).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <button
                    onClick={() => onToggleImportant(task._id)}
                    className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${task.isImportant ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-500 hover:text-yellow-400'}`}
                    title={task.isImportant ? "Unmark Important" : "Mark Important"}
                >
                    <Star size={18} fill={task.isImportant ? "currentColor" : "none"} />
                </button>
                <button
                    onClick={() => onDelete(task._id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                    title="Delete Task"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            {task.isImportant && (
                <div className="absolute top-4 right-4 group-hover:hidden transition-opacity">
                    <Star size={18} className="text-yellow-400 fill-yellow-400 drop-shadow-lg" />
                </div>
            )}
        </div>
    );
};

export default TaskCard;
