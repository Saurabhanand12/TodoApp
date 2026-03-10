import React, { useState, useRef, useEffect } from 'react';
import { Star, Trash2, User, Briefcase, ShoppingCart, Edit3, Check, X } from 'lucide-react';

const CATEGORY_META = {
    personal: { label: 'Personal', icon: <User size={11} />, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
    work: { label: 'Work', icon: <Briefcase size={11} />, color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
    grocery: { label: 'Grocery', icon: <ShoppingCart size={11} />, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
};

const TaskCard = ({ task, onToggleComplete, onToggleImportant, onDelete, onUpdateTask, onDragStart, onDragOverCard, onDropOnCard }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(task.text);
    const [isDragTarget, setIsDragTarget] = useState(false);
    const inputRef = useRef(null);
    const catMeta = CATEGORY_META[task.category] || CATEGORY_META.personal;

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (editText.trim() && editText !== task.text) {
            onUpdateTask(task._id, { text: editText.trim() });
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') {
            setEditText(task.text);
            setIsEditing(false);
        }
    };

    return (
        <div
            draggable={!isEditing}
            onDragStart={(e) => {
                if (!isEditing && onDragStart) onDragStart(e, task);
            }}
            onDragOver={(e) => {
                if (onDragOverCard) {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragTarget(true);
                    onDragOverCard(e, task);
                }
            }}
            onDragLeave={() => setIsDragTarget(false)}
            onDrop={(e) => {
                setIsDragTarget(false);
                if (onDropOnCard) {
                    e.preventDefault();
                    e.stopPropagation();
                    onDropOnCard(e, task);
                }
            }}
            className={`group cursor-move bg-[#1a1a1a]/60 backdrop-blur-sm p-4 rounded-xl border ${isDragTarget ? 'border-blue-500 bg-[#1a1a1a] shadow-blue-500/20 shadow-lg scale-[1.02]' : 'border-white/5'} hover:border-white/10 hover:bg-[#1a1a1a]/80 transition-all duration-300 flex items-start gap-4 mb-3 shadow-lg shadow-black/10 relative hover:shadow-black/20 hover:scale-[1.005]`}
        >
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
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleSave}
                            className="flex-1 bg-white/5 border border-blue-500/50 rounded px-2 py-1 text-[15px] text-gray-200 outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                ) : (
                    <p
                        onDoubleClick={() => setIsEditing(true)}
                        className={`text-[15px] font-medium leading-normal break-words transition-colors duration-300 cursor-pointer ${task.completed ? 'line-through text-gray-500 decoration-gray-600' : 'text-gray-200'}`}
                    >
                        {task.text}
                    </p>
                )}
                <div className="flex items-center gap-3 mt-2">
                    <span className={`flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${catMeta.color}`}>
                        {catMeta.icon}
                        {catMeta.label}
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
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-blue-400 transition-colors"
                    title="Edit Task"
                >
                    <Edit3 size={18} />
                </button>
                <button
                    onClick={() => onDelete(task._id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                    title="Delete Task"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            {task.isImportant && !isEditing && (
                <div className="absolute top-4 right-4 group-hover:hidden transition-opacity">
                    <Star size={18} className="text-yellow-400 fill-yellow-400 drop-shadow-lg" />
                </div>
            )}
        </div>
    );
};

export default React.memo(TaskCard);
