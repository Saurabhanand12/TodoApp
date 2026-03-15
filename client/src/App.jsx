import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { API, api, formatError } from './utils/api';
import logger from './utils/logger';
import MainLayout from './layouts/MainLayout';
import DayColumn from './layouts/DayColumn';
import TaskCard from './layouts/TaskCard';
import CategoryFilterDropdown from './components/CategoryFilterDropdown';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import UndoToast from './components/UndoToast';
import FeedbackButton from './components/FeedbackButton';
import AdminFeedback from './components/AdminFeedback';
import AuthModal from './components/AuthModal';
import UsernameEditModal from './components/UsernameEditModal';
import { User, Briefcase, ShoppingCart, CheckSquare, Trash2 } from 'lucide-react';
import CustomCursor from './components/CustomCursor';
import './index.css';


axios.defaults.withCredentials = true;

// Category metadata (single source of truth)
const CATEGORY_TABS = [
  { id: 'all-tasks', label: 'All Tasks', icon: <CheckSquare size={22} />, color: 'text-green-400', filter: 'all' },
  { id: 'personal', label: 'Personal', icon: <User size={22} />, color: 'text-blue-400', filter: 'personal' },
  { id: 'work', label: 'Work', icon: <Briefcase size={22} />, color: 'text-orange-400', filter: 'work' },
  { id: 'grocery', label: 'Grocery List', icon: <ShoppingCart size={22} />, color: 'text-emerald-400', filter: 'grocery' },
];

function App() {
  // ─── Authentication state ──────────────────────────────────────────
  const [username, setUsername] = useState(localStorage.getItem('todo_user') || '');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/api/user/me');
        const confirmedUser = res.data.username;
        setUsername(confirmedUser);
        localStorage.setItem('todo_user', confirmedUser);
      } catch (err) {
        setUsername('');
        localStorage.removeItem('todo_user');
        setShowModal(true);
      } finally {
        setIsInitializing(false);
      }
    };
    checkAuth();
  }, []);

  // ─── Task state ───────────────────────────────────────────────────
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('my-day');

  // Filter state for My Day
  const [dayFilter, setDayFilter] = useState('all');

  // Redirection for non-admin trying to access admin views
  useEffect(() => {
    if (activeTab === 'admin-feedback' && username !== 'admin_saurabhanand88') {
      setActiveTab('my-day');
    }
  }, [activeTab, username]);

  // Undo state - refs used to prevent stale closures inside setTimeout
  const [undoQueue, setUndoQueue] = useState(null); // { task, timeoutId }
  const undoTimeoutRef = useRef(null);
  const undoTaskRef = useRef(null);

  // ─── Fetch tasks by username ──────────────────────────────────────
  const fetchTasks = useCallback(async (user) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/tasks/${user}`);
      setTasks(res.data);
    } catch (err) {
      logger.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when username is available
  useEffect(() => {
    if (username) fetchTasks(username);
  }, [username, fetchTasks]);

  // ─── Handle authentication set from modal ─────────────────────────
  const handleAuthSuccess = useCallback((newUsername, token) => {
    setUsername(newUsername);
    localStorage.setItem('todo_user', newUsername);
    if (token) localStorage.setItem('todo_token', token);
    setTasks([]);
    setShowModal(false);
    fetchTasks(newUsername);
  }, [fetchTasks]);

  // Handle Logout
  const handleLogout = useCallback(async () => {
    try {
      await api.post('/api/user/logout');
      setUsername('');
      localStorage.removeItem('todo_user');
      localStorage.removeItem('todo_token');
      setTasks([]);
      setShowModal(true);
    } catch (err) {
      logger.error('Logout failed:', err);
    }
  }, []);

  // ─── Handle edit username ──────────────────
  const handleEditUsername = useCallback(() => {
    setShowEditModal(true);
  }, []);

  const performUsernameUpdate = async (newName) => {
    try {
      setLoading(true);
      const res = await api.put('/api/user/change-username', {
        newUsername: newName
      });

      const updatedName = res.data.username;
      setUsername(updatedName);
      localStorage.setItem('todo_user', updatedName);

      // Update tasks locally
      setTasks(prev => prev.map(t => ({ ...t, username: updatedName })));
      setShowEditModal(false);
      // Removed alert for cleaner UX, the modal success state handles it or we can add a toast later
    } catch (err) {
      throw err; // Let the modal handle the error display
    } finally {
      setLoading(false);
    }
  };

  // ─── Task operations ──────────────────────────────────────────────
  const handleAddTask = useCallback(async (text, category, date) => {
    if (!text || !username) return;
    try {
      const res = await api.post('/api/tasks', {
        text,
        username,
        category: category || 'personal',
        due_date: date ? new Date(date) : new Date()
      });
      setTasks(prev => [res.data, ...prev]);
    } catch (err) {
      logger.error('Error adding task:', err);
    }
  }, [username]);

  const toggleImportant = useCallback(async (id) => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;
    try {
      // Optimistic
      setTasks(prev => prev.map(t => (t._id === id ? { ...t, isImportant: !t.isImportant } : t)));
      const res = await api.put(`/api/tasks/${id}`, { isImportant: !task.isImportant });
      setTasks(prev => prev.map(t => (t._id === id ? res.data : t)));
    } catch (err) {
      logger.error('Error toggling important:', err);
      if (username) fetchTasks(username);
    }
  }, [tasks, username, fetchTasks]);

  // ─── Undo, Delete & Complete logic ────────────────────────────────────────
  const commitDelete = useCallback(async (id) => {
    try {
      await api.delete(`/api/tasks/${id}`);
    } catch (err) {
      logger.error('Error committing delete:', err);
      if (username) fetchTasks(username);
    }
    setUndoQueue(null);
  }, [username, fetchTasks]);

  const processPendingUndo = useCallback(() => {
    if (!undoTaskRef.current) return;
    clearTimeout(undoTimeoutRef.current);
    commitDelete(undoTaskRef.current._id);
    undoTaskRef.current = null;
    undoTimeoutRef.current = null;
    setUndoQueue(null);
  }, [commitDelete]);

  const deleteTodo = useCallback((id) => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;

    if (undoTaskRef.current && undoTaskRef.current._id !== id) {
      processPendingUndo();
    }

    // Optimistic update
    setTasks(prev => prev.filter(t => t._id !== id));

    const timeoutId = setTimeout(() => {
      if (undoTaskRef.current && undoTaskRef.current._id === id) {
        commitDelete(id);
        undoTaskRef.current = null;
        undoTimeoutRef.current = null;
        setUndoQueue(null);
      }
    }, 8000);

    undoTaskRef.current = task;
    undoTimeoutRef.current = timeoutId;
    setUndoQueue({ task, timeoutId, action: 'delete' });
  }, [tasks, processPendingUndo, commitDelete]);

  const toggleComplete = useCallback(async (id) => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;

    const newCompletedState = !task.completed;

    // Optimistic update
    setTasks(prev => prev.map(t => (t._id === id ? { ...t, completed: newCompletedState } : t)));

    try {
      const res = await api.put(`/api/tasks/${id}`, { completed: newCompletedState });
      setTasks(prev => prev.map(t => (t._id === id ? res.data : t)));
    } catch (err) {
      logger.error('Error committing complete:', err);
      if (username) fetchTasks(username);
    }
  }, [tasks, username, fetchTasks]);

  const handleUpdateTask = useCallback(async (id, updates) => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => (t._id === id ? { ...t, ...updates } : t)));
      const res = await api.put(`/api/tasks/${id}`, updates);
      setTasks(prev => prev.map(t => (t._id === id ? res.data : t)));
    } catch (err) {
      logger.error('Error updating task:', err);
      if (username) fetchTasks(username);
    }
  }, [username, fetchTasks]);

  const handleDeleteCompleted = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.delete(`/api/tasks/completed/${username}`);
      if (res.data.deletedCount > 0) {
        setTasks(prev => prev.filter(t => !t.completed));
      }
    } catch (err) {
      logger.error('Error deleting completed tasks:', err);
      if (username) fetchTasks(username);
    } finally {
      setLoading(false);
    }
  }, [username, fetchTasks]);

  const handleUndo = useCallback(() => {
    if (!undoTaskRef.current) return;

    clearTimeout(undoTimeoutRef.current);
    const taskToRestore = undoTaskRef.current;

    setTasks(prev => {
      const newTasks = [...prev, taskToRestore];
      return newTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    });

    undoTaskRef.current = null;
    undoTimeoutRef.current = null;
    setUndoQueue(null);
  }, []);

  // ─── Date & View helpers ──────────────────────────────────────────
  const normalizeDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  const today = useMemo(() => new Date(), []);

  // ─── Drag and Drop logic ──────────────────────────────────────────
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event) => {
    const { active } = event;
    const task = active.data.current?.task;
    setActiveTask(task);
  }, []);

  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const draggedTask = active.data.current?.task;
    const overType = over.data.current?.type;

    if (!draggedTask) return;

    // Dropping onto an empty column or into a different column directly
    if (overType === 'Column') {
      const targetId = over.id; // Either 'Today', 'Tomorrow', 'Monday', or 'my-day', etc.

      if (activeTab === 'planned') {
        const dayNames = [...Array(7)].map((_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          let title = d.toLocaleDateString('en-US', { weekday: 'long' });
          if (i === 0) title = 'Today';
          if (i === 1) title = 'Tomorrow';
          return title;
        });

        const offset = dayNames.indexOf(targetId);
        if (offset !== -1) {
          const targetDate = new Date(today);
          targetDate.setDate(today.getDate() + offset);
          targetDate.setHours(0, 0, 0, 0);

          const isSameDate = new Date(draggedTask.due_date).setHours(0, 0, 0, 0) === targetDate.getTime();
          if (!isSameDate) {
            await handleUpdateTask(draggedTask._id, { due_date: targetDate, position: 0 });
          }
        }
      }
      return;
    }

    // Dropping onto a task (reordering or moving)
    if (overType === 'Task') {
      const targetTask = over.data.current?.task;
      if (!targetTask || draggedTask._id === targetTask._id) return;

      const groupByDate = activeTab === 'planned' || activeTab === 'my-day';
      let columnTasks = tasks.filter(t => {
        if (groupByDate) return normalizeDate(t.due_date) === normalizeDate(targetTask.due_date);
        return t.category === targetTask.category || (!t.category && targetTask.category === 'personal');
      });

      columnTasks.sort((a, b) => (a.position || 0) - (b.position || 0));
      columnTasks = columnTasks.filter(t => t._id !== draggedTask._id);

      const targetIndex = columnTasks.findIndex(t => t._id === targetTask._id);
      if (targetIndex === -1) return;

      const updatedTask = { ...draggedTask };
      if (groupByDate) updatedTask.due_date = targetTask.due_date;
      else updatedTask.category = targetTask.category;

      columnTasks.splice(targetIndex, 0, updatedTask);

      const updates = columnTasks.map((t, index) => ({ _id: t._id, position: index }));

      setTasks(prev => prev.map(p => {
        const update = updates.find(u => u._id === p._id);
        if (update) {
          return {
            ...p,
            position: update.position,
            due_date: p._id === draggedTask._id ? updatedTask.due_date : p.due_date,
            category: p._id === draggedTask._id ? updatedTask.category : p.category
          };
        }
        return p;
      }));

      try {
        await api.put('/api/tasks/reorder/bulk', { tasks: updates });
      } catch (err) {
        logger.error('Failed to save manual order:', err);
        if (username) fetchTasks(username);
      }
    }
  }, [activeTab, tasks, today, username, fetchTasks, handleUpdateTask, API]);

  const getDayTasks = useCallback((dateOffset) => {
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + dateOffset);
    const targetNormalized = normalizeDate(targetDate);
    return tasks.filter(task => normalizeDate(task.due_date) === targetNormalized);
  }, [tasks, today]);

  const myDayTasks = useMemo(() => getDayTasks(0), [getDayTasks]);

  // Apply category filter to My Day view
  const myDayFilteredTasks = useMemo(() => {
    if (dayFilter === 'all') return myDayTasks;
    return myDayTasks.filter(t => t.category === dayFilter);
  }, [myDayTasks, dayFilter]);

  const getFilteredTasks = useCallback((categoryFilter) => {
    const filtered = categoryFilter && categoryFilter !== 'all' ? tasks.filter(t => t.category === categoryFilter) : tasks;
    return [...filtered].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const dateA = normalizeDate(a.due_date);
      const dateB = normalizeDate(b.due_date);
      if (dateA !== dateB) return dateA - dateB;
      return (a.position || 0) - (b.position || 0);
    });
  }, [tasks]);

  // Calculate notification counts
  const counts = useMemo(() => {
    return {
      all: tasks.filter(t => !t.completed).length,
      personal: tasks.filter(t => (!t.category || t.category === 'personal') && !t.completed).length,
      work: tasks.filter(t => t.category === 'work' && !t.completed).length,
      grocery: tasks.filter(t => t.category === 'grocery' && !t.completed).length,
    };
  }, [tasks]);

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <>
      <CustomCursor />
      {showModal && <AuthModal onAuthSuccess={handleAuthSuccess} />}
      {showEditModal && (
        <UsernameEditModal
          currentUsername={username}
          onSave={performUsernameUpdate}
          onCancel={() => setShowEditModal(false)}
        />
      )}

      {isInitializing ? (
        <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center z-[200]">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <UndoToast
            undoTask={undoQueue?.task}
            undoAction={undoQueue?.action}
            onUndo={handleUndo}
            onDismiss={processPendingUndo}
          />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <MainLayout
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              username={username}
              onEditUsername={handleEditUsername}
              counts={counts}
              onLogout={handleLogout}
            >
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm">Loading your tasks...</p>
                  </div>
                </div>
              ) : (
                <div className="flex h-full gap-6">

                  {/* MY DAY VIEW */}
                  {activeTab === 'my-day' && (
                    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full pt-4">

                      {/* Category Filter */}
                      <CategoryFilterDropdown
                        options={CATEGORY_TABS}
                        activeFilter={dayFilter}
                        onFilterChange={setDayFilter}
                      />

                      {/* Important Section */}

                      {/* Delete Completed Button for My Day */}
                      {myDayFilteredTasks.some(t => t.completed) && (
                        <div className="flex justify-end mb-4">
                          <button
                            onClick={handleDeleteCompleted}
                            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-500/20 flex items-center gap-2"
                          >
                            <Trash2 size={16} /> Delete Completed Tasks
                          </button>
                        </div>
                      )}

                      <div className="mb-6 md:mb-8">
                        <h2 className="text-lg md:text-xl font-bold text-yellow-400 mb-3 md:mb-4 flex items-center gap-2">
                          <span className="text-xl md:text-2xl">⭐</span> Important Tasks
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                          {myDayFilteredTasks.filter(t => t.isImportant).map(task => (
                            <div key={task._id}>
                              <div className="bg-[#1e1e1e] border border-yellow-500/20 p-4 rounded-lg">
                                <TaskCard
                                  task={task}
                                  onToggleComplete={toggleComplete}
                                  onToggleImportant={toggleImportant}
                                  onDelete={deleteTodo}
                                  onUpdateTask={handleUpdateTask}
                                />
                              </div>
                            </div>
                          ))}
                          {myDayFilteredTasks.filter(t => t.isImportant).length === 0 && (
                            <p className="text-gray-500 italic">No important tasks for this view.</p>
                          )}
                        </div>
                      </div>

                      {/* All Tasks Section */}
                      <div className="flex-1 flex flex-col">
                        <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 flex items-center gap-2">
                          <span className="text-xl md:text-2xl">📋</span> Tasks
                        </h2>
                        <DayColumn
                          title=""
                          date=""
                          tasks={[...myDayFilteredTasks].sort((a, b) => (a.position || 0) - (b.position || 0))}
                          onAddTask={(text, category) => { if (text) handleAddTask(text, category, today); }}
                          onToggleComplete={toggleComplete}
                          onToggleImportant={toggleImportant}
                          onDelete={deleteTodo}
                          onUpdateTask={handleUpdateTask}
                          hideHeader={true}
                          defaultCategory={dayFilter !== 'all' ? dayFilter : 'personal'}
                        />
                      </div>
                    </div>
                  )}

                  {/* PLANNED VIEW */}
                  {activeTab === 'planned' && (
                    <div className="flex flex-col h-full w-full">

                      {/* Delete Completed Button for Planned View */}
                      {tasks.some(t => t.completed) && (
                        <div className="flex justify-end mb-4 pr-6 pt-4">
                          <button
                            onClick={handleDeleteCompleted}
                            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-500/20 flex items-center gap-2"
                          >
                            <Trash2 size={16} /> Delete Completed
                          </button>
                        </div>
                      )}

                      <div className="flex flex-col md:flex-row gap-6 overflow-x-hidden md:overflow-x-auto planned-scrollbar pb-4 px-2">
                        {[...Array(7)].map((_, index) => {
                          const date = new Date();
                          date.setDate(today.getDate() + index);
                          const dateString = date.toLocaleDateString('en-US', { weekday: 'long' });
                          let title = dateString;
                          if (index === 0) title = 'Today';
                          if (index === 1) title = 'Tomorrow';
                          return (
                            <DayColumn
                              key={index}
                              title={title}
                              date={title !== dateString ? dateString : ''}
                              tasks={getDayTasks(index)}
                              onAddTask={(text, category) => { if (text) handleAddTask(text, category, date); }}
                              onToggleComplete={toggleComplete}
                              onToggleImportant={toggleImportant}
                              onDelete={deleteTodo}
                              onUpdateTask={handleUpdateTask}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* IMPORTANT VIEW */}
                  {activeTab === 'important' && (
                    <div className="max-w-4xl mx-auto w-full">
                      <h2 className="text-2xl font-bold text-white mb-6">Important Tasks</h2>
                      <div className="space-y-2">
                        {tasks.filter(t => t.isImportant).map(task => (
                          <TaskCard
                            key={task._id}
                            task={task}
                            onToggleComplete={toggleComplete}
                            onToggleImportant={toggleImportant}
                            onDelete={deleteTodo}
                            onUpdateTask={handleUpdateTask}
                          />
                        ))}
                        {tasks.filter(t => t.isImportant).length === 0 && (
                          <p className="text-gray-500 italic">No important tasks yet.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CATEGORY VIEWS */}
                  {CATEGORY_TABS.map(tab => (
                    activeTab === tab.id && (
                      <div key={tab.id} className="max-w-4xl mx-auto w-full">
                        {/* Header */}
                        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                          <span className={tab.color}>{tab.icon}</span>
                          <h2 className="text-xl md:text-2xl font-bold text-white">{tab.label}</h2>
                          <span className="ml-auto text-xs md:text-sm text-gray-500 bg-white/5 px-2 md:px-3 py-1 rounded-full border border-white/10">
                            {getFilteredTasks(tab.filter).length} task{getFilteredTasks(tab.filter).length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Delete Completed Button for Category */}
                        {getFilteredTasks(tab.filter).some(t => t.completed) && (
                          <div className="flex justify-end mb-4">
                            <button
                              onClick={handleDeleteCompleted}
                              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-500/20 flex items-center gap-2"
                            >
                              <Trash2 size={16} /> Delete Completed
                            </button>
                          </div>
                        )}

                        {/* Add Task */}
                        <DayColumn
                          title=""
                          date=""
                          tasks={getFilteredTasks(tab.filter)}
                          onAddTask={(text, category) => { if (text) handleAddTask(text, category); }}
                          onToggleComplete={toggleComplete}
                          onToggleImportant={toggleImportant}
                          onDelete={deleteTodo}
                          onUpdateTask={handleUpdateTask}
                          hideHeader={true}
                          defaultCategory={tab.filter !== 'all' ? tab.filter : 'personal'}
                        />
                      </div>
                    )
                  ))}

                  {/* ADMIN FEEDBACK VIEW */}
                  {activeTab === 'admin-feedback' && (
                    <AdminFeedback />
                  )}

                </div>
              )}

              {/* Floating Feedback Button - All users */}
              <FeedbackButton username={username} />
            </MainLayout>

            <DragOverlay>
              {activeTask ? (
                <TaskCard
                  task={activeTask}
                  onToggleComplete={() => { }}
                  onToggleImportant={() => { }}
                  onDelete={() => { }}
                  onUpdateTask={() => { }}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </>
      )}
    </>
  );
}

export default App;
