import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import MainLayout from './layouts/MainLayout';
import DayColumn from './layouts/DayColumn';
import TaskCard from './layouts/TaskCard';
import CategoryFilterDropdown from './components/CategoryFilterDropdown';
import UndoToast from './components/UndoToast';
import FeedbackButton from './components/FeedbackButton';
import AdminFeedback from './components/AdminFeedback';
import AuthModal from './components/AuthModal';
import { User, Briefcase, ShoppingCart, CheckSquare } from 'lucide-react';
import './index.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
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
  const [username, setUsername] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${API}/api/user/me`);
        setUsername(res.data.username);
      } catch (err) {
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

  // Undo state
  const [undoQueue, setUndoQueue] = useState(null); // { task, timeoutId }

  // ─── Fetch tasks by username ──────────────────────────────────────
  const fetchTasks = useCallback(async (user) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/tasks/${user}`);
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when username is available
  useEffect(() => {
    if (username) fetchTasks(username);
  }, [username, fetchTasks]);

  // ─── Handle authentication set from modal ─────────────────────────
  const handleAuthSuccess = useCallback((newUsername) => {
    setUsername(newUsername);
    setTasks([]);
    setShowModal(false);
    fetchTasks(newUsername);
  }, [fetchTasks]);

  // Handle Logout
  const handleLogout = useCallback(async () => {
    try {
      await axios.post(`${API}/api/user/logout`);
      setUsername('');
      setTasks([]);
      setShowModal(true);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }, []);

  // ─── Handle edit username (now logout for safety) ──────────────────
  const handleEditUsername = useCallback(() => {
    handleLogout();
  }, [handleLogout]);

  // ─── Task operations ──────────────────────────────────────────────
  const handleAddTask = useCallback(async (text, category, date) => {
    if (!text || !username) return;
    try {
      const res = await axios.post(`${API}/api/tasks`, {
        text,
        username,
        category: category || 'personal',
        due_date: date ? new Date(date) : new Date()
      });
      setTasks(prev => [res.data, ...prev]);
    } catch (err) {
      console.error('Error adding task:', err);
    }
  }, [username]);

  const toggleImportant = useCallback(async (id) => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;
    try {
      // Optimistic
      setTasks(prev => prev.map(t => (t._id === id ? { ...t, isImportant: !t.isImportant } : t)));
      const res = await axios.put(`${API}/api/tasks/${id}`, { isImportant: !task.isImportant });
      setTasks(prev => prev.map(t => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error('Error toggling important:', err);
      if (username) fetchTasks(username);
    }
  }, [tasks, username, fetchTasks]);

  // ─── Undo, Delete & Complete logic ────────────────────────────────────────
  const commitDelete = useCallback(async (id) => {
    try {
      await axios.delete(`${API}/api/tasks/${id}`);
    } catch (err) {
      console.error('Error committing delete:', err);
      if (username) fetchTasks(username);
    }
    setUndoQueue(null);
  }, [username, fetchTasks]);

  const processPendingUndo = useCallback(() => {
    if (!undoQueue) return;
    clearTimeout(undoQueue.timeoutId);
    if (undoQueue.action === 'delete') {
      commitDelete(undoQueue.task._id);
    }
  }, [undoQueue, commitDelete]);

  const deleteTodo = useCallback((id) => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;

    if (undoQueue && undoQueue.task._id !== id) {
      processPendingUndo();
    }

    // Optimistic update
    setTasks(prev => prev.filter(t => t._id !== id));

    const timeoutId = setTimeout(() => {
      commitDelete(id);
    }, 8000);

    setUndoQueue({ task, timeoutId, action: 'delete' });
  }, [tasks, undoQueue, processPendingUndo, commitDelete]);

  const toggleComplete = useCallback(async (id) => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;

    const newCompletedState = !task.completed;

    // Optimistic update
    setTasks(prev => prev.map(t => (t._id === id ? { ...t, completed: newCompletedState } : t)));

    try {
      const res = await axios.put(`${API}/api/tasks/${id}`, { completed: newCompletedState });
      setTasks(prev => prev.map(t => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error('Error committing complete:', err);
      if (username) fetchTasks(username);
    }
  }, [tasks, username, fetchTasks]);

  const handleUndo = useCallback(() => {
    if (!undoQueue) return;
    clearTimeout(undoQueue.timeoutId);

    if (undoQueue.action === 'delete') {
      setTasks(prev => {
        const newTasks = [...prev, undoQueue.task];
        return newTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      });
    }

    setUndoQueue(null);
  }, [undoQueue]);

  // ─── Date & View helpers ──────────────────────────────────────────
  const normalizeDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  const today = useMemo(() => new Date(), []);

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

  const getFilteredTasks = useCallback((categoryFilter) =>
    categoryFilter && categoryFilter !== 'all' ? tasks.filter(t => t.category === categoryFilter) : tasks
    , [tasks]);

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
      {showModal && <AuthModal onAuthSuccess={handleAuthSuccess} />}

      {isInitializing ? (
        <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center z-[200]">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <UndoToast undoTask={undoQueue?.task} undoAction={undoQueue?.action} onUndo={handleUndo} />

          <MainLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            username={username}
            onEditUsername={handleEditUsername}
            counts={counts}
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
                        tasks={myDayFilteredTasks}
                        onAddTask={(text, category) => { if (text) handleAddTask(text, category, today); }}
                        onToggleComplete={toggleComplete}
                        onToggleImportant={toggleImportant}
                        onDelete={deleteTodo}
                        hideHeader={true}
                        defaultCategory={dayFilter !== 'all' ? dayFilter : 'personal'}
                      />
                    </div>
                  </div>
                )}

                {/* PLANNED VIEW */}
                {activeTab === 'planned' && (
                  <div className="flex flex-col md:flex-row h-full gap-6 w-full overflow-x-hidden md:overflow-x-auto">
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
                          date={dateString}
                          tasks={getDayTasks(index)}
                          onAddTask={(text, category) => { if (text) handleAddTask(text, category, date); }}
                          onToggleComplete={toggleComplete}
                          onToggleImportant={toggleImportant}
                          onDelete={deleteTodo}
                        />
                      );
                    })}
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

                      {/* Add Task */}
                      <DayColumn
                        title=""
                        date=""
                        tasks={getFilteredTasks(tab.filter)}
                        onAddTask={(text, category) => { if (text) handleAddTask(text, category); }}
                        onToggleComplete={toggleComplete}
                        onToggleImportant={toggleImportant}
                        onDelete={deleteTodo}
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

            {/* Floating Feedback Button - Admin only */}
            {username === 'admin_saurabhanand88' && <FeedbackButton username={username} />}
          </MainLayout>
        </>
      )}
    </>
  );
}

export default App;
