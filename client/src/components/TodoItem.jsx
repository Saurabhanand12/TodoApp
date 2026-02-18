import React from 'react';

function TodoItem({ todo, completeTodo, deleteTodo }) {
    return (
        <div
            className={`group flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] border border-transparent ${todo.completed
                    ? 'bg-slate-900/40 border-slate-800'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/50 shadow-md hover:shadow-lg hover:border-purple-500/30'
                }`}
        >
            <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => completeTodo(todo._id)}>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${todo.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-purple-400 group-hover:border-purple-500'
                    }`}>
                    {todo.completed && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                    )}
                </div>

                <span className={`text-lg transition-all duration-300 ${todo.completed
                        ? 'text-slate-500 line-through decoration-slate-600'
                        : 'text-slate-100'
                    }`}>
                    {todo.text}
                </span>
            </div>

            <button
                className="opacity-0 group-hover:opacity-100 p-2 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all duration-200"
                onClick={(e) => {
                    e.stopPropagation();
                    deleteTodo(todo._id);
                }}
                aria-label="Delete task"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
            </button>
        </div>
    );
}

export default TodoItem;
