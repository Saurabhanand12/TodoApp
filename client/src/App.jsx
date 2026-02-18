import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from './layouts/MainLayout';
import DayColumn from './layouts/DayColumn';
import TaskCard from './layouts/TaskCard';
import './index.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('my-day');
  const [userName, setUserName] = useState('Saurabh Anand');

  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    if (savedName) setUserName(savedName);
  }, []);

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/todos');
      setTasks(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (text, date) => {
    if (!text) return;
    try {
      const res = await axios.post('http://localhost:5000/todos', {
        text,
        due_date: date ? new Date(date) : new Date()
      });
      setTasks([...tasks, res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/todos/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComplete = async (id) => {
    const task = tasks.find(t => t._id === id);
    try {
      const res = await axios.put(`http://localhost:5000/todos/${id}`, {
        completed: !task.completed
      });
      setTasks(tasks.map(t => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleImportant = async (id) => {
    const task = tasks.find(t => t._id === id);
    try {
      const res = await axios.put(`http://localhost:5000/todos/${id}`, {
        isImportant: !task.isImportant
      });
      setTasks(tasks.map(t => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error(err);
    }
  };


  // Helper to normalize date (strip time)
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

    return tasks.filter(task => {
      const taskDate = normalizeDate(task.due_date);
      return taskDate === targetNormalized;
    });
  };

  if (loading) return <div className="text-white flex items-center justify-center h-screen">Loading...</div>;

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab} userName={userName}>
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
                onAddTask={(text) => {
                  if (text) handleAddTask(text, today);
                }}
                onToggleComplete={toggleComplete}
                onToggleImportant={toggleImportant}
                onDelete={deleteTodo}
                hideHeader={true}
              />
            </div>
          </div>
        )}

        {/* PLANNED VIEW (Old 7-day view) */}
        {activeTab === 'planned' && (
          <div className="flex h-full gap-6 w-full overflow-x-auto">
            {[...Array(7)].map((_, index) => {
              const date = new Date();
              date.setDate(today.getDate() + index);
              const dateString = date.toLocaleDateString('en-US', { weekday: 'long' });

              let title = dateString;
              if (index === 0) title = "Today";
              if (index === 1) title = "Tomorrow";

              const tasksForDay = getDayTasks(index);

              return (
                <DayColumn
                  key={index}
                  title={title}
                  date={dateString}
                  tasks={tasksForDay}
                  onAddTask={(text) => {
                    if (text) handleAddTask(text, date);
                  }}
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
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}

export default App;
