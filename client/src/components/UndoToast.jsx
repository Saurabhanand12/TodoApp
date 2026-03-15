import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const UndoToast = ({ undoTask, undoAction, onUndo, onDismiss }) => {
    const [progress, setProgress] = React.useState(100);

    React.useEffect(() => {
        if (!undoTask) return;

        // Start animation after a tiny delay to ensure CSS transition triggers
        setProgress(100);
        const startTimer = setTimeout(() => {
            setProgress(0);
        }, 50);

        return () => clearTimeout(startTimer);
    }, [undoTask]);

    if (!undoTask) return null;

    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-modal-in">
            <div className="bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl shadow-black/50 flex flex-col gap-3 min-w-[300px] relative pr-10">
                <button
                    onClick={onDismiss}
                    className="absolute top-2 right-2 text-gray-500 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                    <X size={16} />
                </button>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col min-w-0 pr-4">
                        <span className="text-sm font-bold text-white mb-0.5 whitespace-nowrap">
                            {undoAction === 'delete' ? 'Task Deleted' : 'Task Completed'}
                        </span>
                        <span className="text-[13px] text-gray-400 truncate w-[200px]">{undoTask.text}</span>
                    </div>
                    <button
                        onClick={() => onUndo(undoTask._id)}
                        className="flex-shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-900/40 active:scale-95"
                    >
                        Undo
                    </button>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                            width: `${progress}%`,
                            transition: progress === 100 ? 'none' : 'width 8s linear'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default React.memo(UndoToast);
