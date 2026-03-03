import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import MainLayout from './layouts/MainLayout';
import DayColumn from './layouts/DayColumn';
import TaskCard from './layouts/TaskCard';
import UsernameModal from './components/UsernameModal';
import './index.css';

const API = 'http://localhost:5000';

function App() {
  // ─── Username state ───────────────────────────────────────────────
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [showModal, setShowModal] = useState(false);

  // Show modal if no username on mount
  useEffect(() => {
    if (!username) setShowModal(true);
  }, []);

  // ─── Task state ───────────────────────────────────────────────────
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('my-day');

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

  // ─── Handle username set from modal ──────────────────────────────
  const handleUsernameSet = (newUsername) => {
    setUsername(newUsername);
    setTasks([]);
    setShowModal(false);
    fetchTasks(newUsername);
  };

  // ─── Handle edit username (re-open modal) ─────────────────────────
  const handleEditUsername = () => {
    setShowModal(true);
  };

  // ─── Task operations ──────────────────────────────────────────────
  const handleAddTask = async (text, date) => {
    if (!text || !username) return;
    try {
      const res = await axios.post(`${API}/api/tasks`, {
        text,
        username,
        due_date: date ? new Date(date) : new Date()
      });
      setTasks(prev => [res.data, ...prev]);
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API}/api/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const toggleComplete = async (id) => {
    const task = tasks.find(t => t._id === id);
    try {
      const res = await axios.put(`${API}/api/tasks/${id}`, { completed: !task.completed });
      setTasks(prev => prev.map(t => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error('Error toggling complete:', err);
    }
  };

  const toggleImportant = async (id) => {
    const task = tasks.find(t => t._id === id);
    try {
      const res = await axios.put(`${API}/api/tasks/${id}`, { isImportant: !task.isImportant });
      setTasks(prev => prev.map(t => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error('Error toggling important:', err);
    }
  };

  // ─── Date helpers ─────────────────────────────────────────────────
  const normalizeDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  const today = new Date();
  const todayNormalized = normalizeDate(today);

  const getDayTasks = (dateOffset) => {
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + dateOffset);
    const targetNormalized = normalizeDate(targetDate);
    return tasks.filter(task => normalizeDate(task.due_date) === targetNormalized);
  };

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <>
      {/* Username Modal — shown on first visit or when editing */}
      {showModal && <UsernameModal onUsernameSet={handleUsernameSet} />}

      {/* App shell — always rendered so modal overlays it nicely */}
      <MainLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        username={username}
        onEditUsername={handleEditUsername}
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

                {/* Important Section */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                    <span className="text-2xl">⭐</span> Important Tasks
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getDayTasks(0).filter(t => t.isImportant).map(task => (
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
                    {getDayTasks(0).filter(t => t.isImportant).length === 0 && (
                      <p className="text-gray-500 italic">No important tasks for today.</p>
                    )}
                  </div>
                </div>

                {/* All Tasks Section */}
                <div className="flex-1 flex flex-col">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">📋</span> All Tasks
                  </h2>
                  <DayColumn
                    title=""
                    date=""
                    tasks={getDayTasks(0)}
                    onAddTask={(text) => { if (text) handleAddTask(text, today); }}
                    onToggleComplete={toggleComplete}
                    onToggleImportant={toggleImportant}
                    onDelete={deleteTodo}
                    hideHeader={true}
                  />
                </div>
              </div>
            )}

            {/* PLANNED VIEW */}
            {activeTab === 'planned' && (
              <div className="flex h-full gap-6 w-full overflow-x-auto">
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
                      onAddTask={(text) => { if (text) handleAddTask(text, date); }}
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

            {/* ALL TASKS VIEW */}
            {activeTab === 'all-tasks' && (
              <div className="max-w-4xl mx-auto w-full">
                <h2 className="text-2xl font-bold text-white mb-6">All Tasks</h2>
                <div className="space-y-2">
                  {tasks.map(task => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onToggleComplete={toggleComplete}
                      onToggleImportant={toggleImportant}
                      onDelete={deleteTodo}
                    />
                  ))}
                  {tasks.length === 0 && (
                    <p className="text-gray-500 italic">No tasks yet. Add your first task!</p>
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </MainLayout>
    </>
  );
}

export default App;
