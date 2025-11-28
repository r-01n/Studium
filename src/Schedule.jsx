import React, { useState, useEffect } from 'react';
import { Home, Plus, Trash2, Calendar, CheckSquare, Link, Edit2, Save, X, Sparkles, Clock, MapPin, AlertCircle, BookOpen, FileText } from 'lucide-react';

const Schedule = ({ setCurrentModule }) => {
  const [items, setItems] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('upcoming');
  const [celebrateId, setCelebrateId] = useState(null);

  // Load and migrate data on mount
  useEffect(() => {
    const scheduleData = localStorage.getItem('scheduleItems');
    
    if (scheduleData) {
      setItems(JSON.parse(scheduleData));
    } else {
      const oldAssignments = JSON.parse(localStorage.getItem('assignments') || '[]');
      const oldEvents = JSON.parse(localStorage.getItem('eventsExams') || '[]');
      
      const migratedAssignments = oldAssignments.map(a => ({
        ...a,
        type: 'assignment',
        date: a.deadline,
      }));
      
      const migratedEvents = oldEvents.map(e => ({
        ...e,
      }));
      
      const allItems = [...migratedAssignments, ...migratedEvents];
      setItems(allItems);
      
      if (allItems.length > 0) {
        localStorage.setItem('scheduleItems', JSON.stringify(allItems));
      }
    }
  }, []);

  useEffect(() => {
    if (items === null) return;
    localStorage.setItem('scheduleItems', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (celebrateId) {
      const timer = setTimeout(() => setCelebrateId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [celebrateId]);

  if (items === null) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4 border-4 border-neutral-900 p-2" />
          <div className="text-neutral-900 font-mono font-bold uppercase">Loading schedule...</div>
        </div>
      </div>
    );
  }

  const createNewItem = (type) => {
    const baseItem = {
      id: Date.now(),
      type: type,
      title: '',
      date: '',
      course: '',
      notes: '',
      recurring: false,           
      recurrenceType: 'none',     
      recurrenceEnd: '',          
      originalDate: ''            
    };

    if (type === 'assignment') {
      setEditingItem({
        ...baseItem,
        priority: 'medium',
        status: 'not-started',
        progress: 0,
        subtasks: [],
        links: []
        
      });
    } else if (type === 'exam') {
      setEditingItem({
        ...baseItem,
        time: '',
        location: ''
      });
    } else {
      setEditingItem({
        ...baseItem,
        time: '',
        location: ''
      });
    }
    
    setShowModal(true);
  };

  const saveItem = () => {
    if (editingItem.id && items.find(i => i.id === editingItem.id)) {
      setItems(items.map(i => i.id === editingItem.id ? editingItem : i));
    } else {
      setItems([...items, editingItem]);
    }
    setShowModal(false);
    setEditingItem(null);
  };

  const deleteItem = (id) => {
    // Handle deleting recurring instance vs parent
    const item = items.find(i => i.id === id);
    if (item && item.isRecurringInstance) {
      if (window.confirm('This is a recurring event. Delete all occurrences?')) {
        setItems(items.filter(i => i.id !== item.parentId));
      }
    } else {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const toggleSubtask = (itemId, subtaskIndex) => {
    setItems(items.map(item => {
      if (item.id === itemId && item.type === 'assignment') {
        const newSubtasks = [...item.subtasks];
        newSubtasks[subtaskIndex] = {
          ...newSubtasks[subtaskIndex],
          completed: !newSubtasks[subtaskIndex].completed
        };
        const completedCount = newSubtasks.filter(s => s.completed).length;
        const progress = newSubtasks.length > 0 ? Math.round((completedCount / newSubtasks.length) * 100) : 0;
        return { ...item, subtasks: newSubtasks, progress };
      }
      return item;
    }));
  };

  const updateStatus = (itemId, newStatus) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, status: newStatus } : item
    ));
    if (newStatus === 'completed') {
      setCelebrateId(itemId);
    }
  };

  const getDaysUntil = (date) => {
    if (!date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const itemDate = new Date(date);
    itemDate.setHours(0, 0, 0, 0);
    const diffTime = itemDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDateLabel = (daysUntil) => {
    if (daysUntil === null) return null;
    if (daysUntil < 0) return `${Math.abs(daysUntil)} days ago`;
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    return `In ${daysUntil} days`;
  };

  const getUrgencyColor = (daysUntil, type, status) => {
    if (daysUntil === null) return 'border-neutral-900 bg-white';
    if (status === 'completed') return 'border-green-600 bg-green-100';
    if (daysUntil < 0) return 'border-red-600 bg-red-100';
    
    if (type === 'assignment' || type === 'exam') {
      if (daysUntil === 0) return 'border-red-600 bg-red-100';
      if (daysUntil <= 3) return 'border-red-400 bg-red-50';
      if (daysUntil <= 7) return 'border-orange-400 bg-orange-50';
      if (daysUntil <= 14) return 'border-yellow-400 bg-yellow-50';
    } else {
      if (daysUntil === 0) return 'border-blue-600 bg-blue-100';
      if (daysUntil <= 3) return 'border-blue-400 bg-blue-50';
      if (daysUntil <= 7) return 'border-green-400 bg-green-50';
    }
    return 'border-neutral-900 bg-white';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600',
      medium: 'text-yellow-600',
      low: 'text-green-600'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusConfig = (status) => {
    const configs = {
      'not-started': { 
        label: 'Not Started', 
        bgColor: 'bg-white', 
        textColor: 'text-neutral-900',
        borderColor: 'border-neutral-900',
        hoverBg: 'hover:bg-neutral-100'
      },
      'in-progress': { 
        label: 'In Progress', 
        bgColor: 'bg-blue-400', 
        textColor: 'text-neutral-900',
        borderColor: 'border-neutral-900',
        hoverBg: 'hover:bg-blue-500'
      },
      'completed': { 
        label: 'Completed', 
        bgColor: 'bg-green-400', 
        textColor: 'text-neutral-900',
        borderColor: 'border-neutral-900',
        hoverBg: 'hover:bg-green-500'
      }
    };
    return configs[status] || configs['not-started'];
  };

  const generateRecurringInstances = () => {
    const instances = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneYearFromNow = new Date(today);
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    items.forEach(item => {
      if (!item.recurring || !item.date || item.recurrenceType === 'none') {
        instances.push(item);
        return;
      }

      const originalDate = new Date(item.originalDate || item.date);
      const endDate = item.recurrenceEnd ? new Date(item.recurrenceEnd) : oneYearFromNow;
      let currentDate = new Date(originalDate);

      while (currentDate <= endDate) {
        // Handle February 29th edge case for yearly recurrence
        if (item.recurrenceType === 'yearly' && originalDate.getMonth() === 1 && originalDate.getDate() === 29) {
          // If it's Feb 29 and current year is not a leap year, use Feb 28
          const year = currentDate.getFullYear();
          const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
          if (!isLeapYear) {
            currentDate.setDate(28);
          }
        }

        // Handle dates beyond month's days (e.g., 31st in a 30-day month)
        if (item.recurrenceType === 'monthly') {
          const targetDay = originalDate.getDate();
          const daysInCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
          if (targetDay > daysInCurrentMonth) {
            currentDate.setDate(daysInCurrentMonth);
          }
        }

        instances.push({
          ...item,
          id: `${item.id}-${currentDate.toISOString().split('T')[0]}`,
          date: currentDate.toISOString().split('T')[0],
          isRecurringInstance: true,
          parentId: item.id
        });

        // Move to next occurrence
        if (item.recurrenceType === 'daily') {
          currentDate.setDate(currentDate.getDate() + 1);
        } else if (item.recurrenceType === 'weekly') {
          currentDate.setDate(currentDate.getDate() + 7);
        } else if (item.recurrenceType === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1);
          currentDate.setDate(originalDate.getDate());
        } else if (item.recurrenceType === 'yearly') {
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          currentDate.setMonth(originalDate.getMonth());
          currentDate.setDate(originalDate.getDate());
        }
      }
    });

    return instances;
  };


  const filterItems = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allInstances = generateRecurringInstances();  
    
    return allInstances  
      .filter(item => {
        if (filter === 'upcoming') {
          if (!item.date) return false;
          if (item.type === 'assignment' && item.status === 'completed') return false;
          return new Date(item.date) >= today;
        }
        if (filter === 'assignments') return item.type === 'assignment' && item.status !== 'completed';
        if (filter === 'exams') return item.type === 'exam';
        if (filter === 'events') return item.type === 'event';
        if (filter === 'completed') return item.type === 'assignment' && item.status === 'completed';
        if (filter === 'past') {
          if (!item.date) return false;
          if (item.type === 'assignment') return false;
          return new Date(item.date) < today;
        }
        return true;
      })
      .sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date);
      });
  };

  const filteredItems = filterItems();
  const upcomingCount = items.filter(i => {
    if (!i.date) return false;
    if (i.type === 'assignment' && i.status === 'completed') return false;
    return new Date(i.date) >= new Date();
  }).length;

  const assignmentsCount = items.filter(i => i.type === 'assignment' && i.status !== 'completed').length;
  const examsCount = items.filter(i => i.type === 'exam').length;
  const eventsCount = items.filter(i => i.type === 'event').length;
  const completedCount = items.filter(i => i.type === 'assignment' && i.status === 'completed').length;

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        <button
          onClick={() => setCurrentModule('dashboard')}
          className="flex items-center gap-2 text-neutral-900 hover:bg-neutral-200 mb-6 transition-colors px-3 py-2 border-2 border-neutral-900"
        >
          <Home className="w-4 h-4" />
          <span className="text-sm uppercase tracking-wider font-mono font-bold">Dashboard</span>
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-neutral-900">SCHEDULE</h1>
            <Calendar className="w-6 h-6 text-neutral-900" />
          </div>
          <p className="text-neutral-700 mb-6 text-base sm:text-lg font-mono uppercase tracking-wide">Assignments, exams & events</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={() => createNewItem('assignment')}
            className="flex-1 items-center justify-center gap-2 bg-neutral-900 text-white px-4 py-3 sm:py-4 text-sm uppercase tracking-wider font-bold border-2 border-neutral-900 hover:bg-neutral-700 transition-all flex shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono"
          >
            <FileText className="w-5 h-5" />
            Assignment
          </button>
          <button
            onClick={() => createNewItem('exam')}
            className="flex-1 items-center justify-center gap-2 border-2 border-neutral-900 bg-white text-neutral-900 px-4 py-3 sm:py-4 text-sm uppercase tracking-wider font-bold hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <BookOpen className="w-5 h-5" />
            Exam
          </button>
          <button
            onClick={() => createNewItem('event')}
            className="flex-1 items-center justify-center gap-2 border-2 border-neutral-900 bg-white text-neutral-900 px-4 py-3 sm:py-4 text-sm uppercase tracking-wider font-bold hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Calendar className="w-5 h-5" />
            Event
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="border-2 border-neutral-900 bg-white mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
          <div className="flex gap-0 min-w-max">
            <button
              onClick={() => setFilter('upcoming')}
              className={`flex-1 px-4 py-3 sm:py-4 text-xs sm:text-sm border-r-2 border-neutral-900 font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filter === 'upcoming' 
                  ? 'bg-neutral-900 text-white' 
                  : 'text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Upcoming ({upcomingCount})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-4 py-3 sm:py-4 text-xs sm:text-sm border-r-2 border-neutral-900 font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filter === 'all' 
                  ? 'bg-neutral-900 text-white' 
                  : 'text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setFilter('assignments')}
              className={`flex-1 px-4 py-3 sm:py-4 text-xs sm:text-sm border-r-2 border-neutral-900 font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filter === 'assignments' 
                  ? 'bg-neutral-900 text-white' 
                  : 'text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Assignments ({assignmentsCount})
            </button>
            <button
              onClick={() => setFilter('exams')}
              className={`flex-1 px-4 py-3 sm:py-4 text-xs sm:text-sm border-r-2 border-neutral-900 font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filter === 'exams' 
                  ? 'bg-neutral-900 text-white' 
                  : 'text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Exams ({examsCount})
            </button>
            <button
              onClick={() => setFilter('events')}
              className={`flex-1 px-4 py-3 sm:py-4 text-xs sm:text-sm border-r-2 border-neutral-900 font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filter === 'events' 
                  ? 'bg-neutral-900 text-white' 
                  : 'text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Events ({eventsCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`flex-1 px-4 py-3 sm:py-4 text-xs sm:text-sm border-r-2 border-neutral-900 font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filter === 'completed' 
                  ? 'bg-neutral-900 text-white' 
                  : 'text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Completed ({completedCount})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`flex-1 px-4 py-3 sm:py-4 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filter === 'past' 
                  ? 'bg-neutral-900 text-white' 
                  : 'text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <div className="border-4 border-dashed border-neutral-900 bg-white p-8 sm:p-12 lg:p-16 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-neutral-400 mx-auto mb-4 border-4 border-neutral-900 p-2" />
            <h3 className="text-lg sm:text-xl font-serif text-neutral-900 mb-2 uppercase">Nothing here yet</h3>
            <p className="text-sm sm:text-base text-neutral-600 mb-6 font-mono">
              Start by adding an assignment, exam, or event
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => createNewItem('assignment')}
                className="bg-neutral-900 text-white px-6 py-3 text-sm uppercase tracking-wider font-bold hover:bg-neutral-700 border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all font-mono"
              >
                Add Assignment
              </button>
              <button
                onClick={() => createNewItem('exam')}
                className="border-2 border-neutral-900 bg-white text-neutral-900 px-6 py-3 text-sm uppercase tracking-wider font-bold hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all font-mono"
              >
                Add Exam
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map(item => {
              const daysUntil = getDaysUntil(item.date);
              const dateLabel = getDateLabel(daysUntil);
              const urgencyColor = getUrgencyColor(daysUntil, item.type, item.status);
              const isCelebrating = celebrateId === item.id;

              return (
                <div
                  key={item.id}
                  className={`border-4 ${urgencyColor} hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${
                    isCelebrating ? 'animate-pulse' : ''
                  }`}
                >
                  {isCelebrating && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-200 via-emerald-200 to-green-200 opacity-50 animate-pulse pointer-events-none z-10">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-16 h-16 text-green-600 animate-spin" />
                      </div>
                    </div>
                  )}

                  <div className="p-4 sm:p-6 relative z-0">
                    <div className="flex items-start justify-between mb-4 gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {item.type === 'assignment' && (
                            <div className="bg-red-400 border-2 border-neutral-900 text-neutral-900 px-3 py-1 text-xs uppercase tracking-wider font-bold font-mono">
                              📝 Assignment
                            </div>
                          )}
                          {item.type === 'exam' && (
                            <div className="bg-orange-400 border-2 border-neutral-900 text-neutral-900 px-3 py-1 text-xs uppercase tracking-wider font-bold font-mono">
                              📚 Exam
                            </div>
                          )}
                          {item.type === 'event' && (
                            <div className="bg-blue-400 border-2 border-neutral-900 text-neutral-900 px-3 py-1 text-xs uppercase tracking-wider font-bold font-mono">
                              📅 Event
                            </div>
                          )}
                          
                          {dateLabel && item.status !== 'completed' && (
                            <span className={`text-xs sm:text-sm font-bold whitespace-nowrap font-mono ${
                              daysUntil < 0 ? 'text-red-600' :
                              daysUntil === 0 ? 'text-red-600' :
                              daysUntil <= 3 ? 'text-orange-600' :
                              daysUntil <= 7 ? 'text-yellow-600' :
                              'text-neutral-900'
                            }`}>
                              {dateLabel}
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl sm:text-2xl font-serif text-neutral-900 mb-2 break-words uppercase">
                          {item.title || 'Untitled'}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-neutral-900 font-mono">
                          {item.course && (
                            <span className="font-bold uppercase">{item.course}</span>
                          )}
                          {item.date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                              {new Date(item.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          )}
                          {item.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                              {item.time}
                            </span>
                          )}
                          {item.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                              {item.location}
                            </span>
                          )}
                          {item.type === 'assignment' && item.priority && (
                            <span className={`capitalize font-bold ${getPriorityColor(item.priority)}`}>
                              {item.priority} priority
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            if (item.isRecurringInstance) {
                              const parent = items.find(i => i.id === item.parentId);
                              if (parent) {
                                setEditingItem(parent);
                                setShowModal(true);
                              }
                            } else {
                              setEditingItem(item);
                              setShowModal(true);
                            }
                          }}
                          className="p-1.5 sm:p-2 border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-1.5 sm:p-2 border-2 border-neutral-900 text-neutral-900 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>

                    {item.type === 'assignment' && (
                      <>
                        {item.subtasks && item.subtasks.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-900 mb-2 font-mono font-bold">
                              <span className="uppercase">Progress</span>
                              <span>{item.progress || 0}%</span>
                            </div>
                            <div className="bg-neutral-200 h-3 overflow-hidden border-2 border-neutral-900">
                              <div 
                                className="bg-neutral-900 h-full transition-all duration-300"
                                style={{ width: `${item.progress || 0}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {item.subtasks && item.subtasks.length > 0 && (
                          <div className="space-y-2 mb-4">
                            {item.subtasks.map((subtask, idx) => (
                              <label
                                key={idx}
                                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white border-2 border-neutral-900 hover:bg-neutral-100 cursor-pointer transition-colors"
                              >
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    checked={subtask.completed}
                                    onChange={() => toggleSubtask(item.id, idx)}
                                    className="w-5 h-5 border-2 border-neutral-900 appearance-none checked:bg-neutral-900 cursor-pointer"
                                  />
                                  {subtask.completed && (
                                    <svg className="w-5 h-5 text-white absolute top-0 left-0 pointer-events-none" viewBox="0 0 16 16" fill="none">
                                      <path d="M3 8L6 11L13 4" stroke="currentColor" strokeWidth="3" />
                                    </svg>
                                  )}
                                </div>
                                <span className={`text-xs sm:text-sm flex-1 break-words font-mono ${subtask.completed ? 'line-through text-neutral-500' : 'text-neutral-900 font-bold'}`}>
                                  {subtask.text}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}

                        {item.links && item.links.length > 0 && (
                          <div className="border-t-2 border-neutral-900 pt-4 mb-4">
                            <div className="text-xs uppercase tracking-wider text-neutral-900 mb-2 font-mono font-bold">Resources</div>
                            <div className="space-y-1">
                              {item.links.map((link, idx) => (
                                <a
                                  key={idx}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline break-all font-mono font-bold"
                                >
                                  <Link className="w-3 h-3 flex-shrink-0" />
                                  {link.label || link.url}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {item.notes && (
                      <div className="border-t-2 border-neutral-900 pt-4 mt-4">
                        <div className="text-xs uppercase tracking-wider text-neutral-900 mb-2 font-mono font-bold">Notes</div>
                        <p className="text-xs sm:text-sm text-neutral-700 whitespace-pre-wrap break-words font-mono">{item.notes}</p>
                      </div>
                    )}

                    {item.type === 'exam' && daysUntil !== null && daysUntil >= 0 && daysUntil <= 14 && (
                      <div className="border-t-2 border-neutral-900 pt-4 mt-4">
                        <div className="flex items-start gap-3 bg-yellow-100 border-2 border-yellow-600 p-3">
                          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-yellow-900 font-mono font-bold">
                            <strong>EXAM REMINDER:</strong> {daysUntil === 0 ? 'TODAY!' : `${daysUntil} DAY${daysUntil !== 1 ? 'S' : ''} TO PREPARE`}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {item.type === 'assignment' && (
                    <div className="border-t-4 border-neutral-900 px-4 sm:px-6 py-3 bg-neutral-50">
                      <div className="flex flex-wrap gap-2">
                        {['not-started', 'in-progress', 'completed'].map(status => {
                          const config = getStatusConfig(status);
                          const isActive = item.status === status;
                          
                          return (
                            <button
                              key={status}
                              onClick={() => updateStatus(item.id, status)}
                              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-all duration-200 border-2 font-mono uppercase tracking-wider ${
                                isActive 
                                  ? `${config.bgColor} ${config.textColor} ${config.borderColor} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
                                  : `bg-white text-neutral-500 border-neutral-900 ${config.hoverBg} hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5`
                              }`}
                            >
                              {status === 'completed' && isActive && '🎉 '}
                              {config.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && editingItem && (
        <ItemModal
          item={editingItem}
          setItem={setEditingItem}
          onSave={saveItem}
          onCancel={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

const ItemModal = ({ item, setItem, onSave, onCancel }) => {
  const [newSubtask, setNewSubtask] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const isAssignment = item.type === 'assignment';
  const isExam = item.type === 'exam';
  const isEvent = item.type === 'event';

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setItem({
      ...item,
      subtasks: [...(item.subtasks || []), { text: newSubtask, completed: false }]
    });
    setNewSubtask('');
  };

  const removeSubtask = (index) => {
    setItem({
      ...item,
      subtasks: item.subtasks.filter((_, i) => i !== index)
    });
  };

  const addLink = () => {
    if (!newLinkUrl.trim()) return;
    setItem({
      ...item,
      links: [...(item.links || []), { label: newLinkLabel || newLinkUrl, url: newLinkUrl }]
    });
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  const removeLink = (index) => {
    setItem({
      ...item,
      links: item.links.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 sm:p-8 z-50 overflow-y-auto">
      <div className="bg-white border-4 border-neutral-900 max-w-2xl w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto my-auto">
        <div className="border-b-4 border-neutral-900 p-4 sm:p-6 flex items-center justify-between sticky top-0 bg-neutral-900 z-10">
          <h2 className="text-xl sm:text-2xl font-serif text-white uppercase">
            {item.id && item.title ? `Edit ${item.type}` : `New ${item.type}`}
          </h2>
          <button onClick={onCancel} className="text-white hover:bg-neutral-700 transition-colors border-2 border-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2">
            {isAssignment && (
              <div className="bg-red-400 border-2 border-neutral-900 text-neutral-900 px-3 py-2 text-xs uppercase tracking-wider font-bold font-mono">
                📝 Assignment
              </div>
            )}
            {isExam && (
              <div className="bg-orange-400 border-2 border-neutral-900 text-neutral-900 px-3 py-2 text-xs uppercase tracking-wider font-bold font-mono">
                📚 Exam
              </div>
            )}
            {isEvent && (
              <div className="bg-blue-400 border-2 border-neutral-900 text-neutral-900 px-3 py-2 text-xs uppercase tracking-wider font-bold font-mono">
                📅 Event
              </div>
            )}
          </div>

          <div>
            <label className="block text-neutral-900 text-xs sm:text-sm uppercase tracking-wider mb-2 font-bold font-mono">
              {isAssignment ? 'Assignment Title' : isExam ? 'Exam Name' : 'Event Name'} *
            </label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => setItem({ ...item, title: e.target.value })}
              placeholder={
                isAssignment ? 'e.g., Research Paper, Problem Set 3' :
                isExam ? 'e.g., Midterm Exam, Final' :
                'e.g., Career Fair, Concert'
              }
              className="w-full border-4 border-neutral-900 px-3 py-3 text-sm sm:text-base text-neutral-900 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono font-bold"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-neutral-900 text-xs sm:text-sm uppercase tracking-wider mb-2 font-bold font-mono">
              Course/Subject
            </label>
            <input
              type="text"
              value={item.course || ''}
              onChange={(e) => setItem({ ...item, course: e.target.value })}
              placeholder="e.g., CS 101, Biology"
              className="w-full border-4 border-neutral-900 px-3 py-3 text-sm sm:text-base text-neutral-900 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono"
            />
          </div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-900 text-xs sm:text-sm uppercase tracking-wider mb-2 font-bold font-mono">
                {isAssignment ? 'Deadline' : 'Date'} *
              </label>
              <input
                type="date"
                value={item.date}
                onChange={(e) => setItem({ ...item, date: e.target.value })}
                className="w-full border-4 border-neutral-900 px-3 py-3 text-sm sm:text-base text-neutral-900 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-neutral-900 text-xs sm:text-sm uppercase tracking-wider mb-2 font-bold font-mono">
                Recurring
              </label>
              <label className="flex items-center gap-2 cursor-pointer h-[50px] border-4 border-neutral-900 px-3 bg-white">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={item.recurring || false}
                    onChange={(e) => {
                      const isRecurring = e.target.checked;
                      setItem({ 
                        ...item, 
                        recurring: isRecurring,
                        recurrenceType: isRecurring ? 'monthly' : 'none',
                        originalDate: item.date || ''
                      });
                    }}
                    className="w-5 h-5 border-2 border-neutral-900 appearance-none checked:bg-neutral-900 cursor-pointer"
                  />
                  {item.recurring && (
                    <svg className="w-5 h-5 text-white absolute inset-0 pointer-events-none" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8L6 11L13 4" stroke="currentColor" strokeWidth="3" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-mono font-bold text-neutral-900">
                  RECURRING EVENT
                </span>
              </label>
            </div>
          </div>

          {item.recurring && (
            <div className="space-y-4">
              <div className="border-2 border-neutral-900 p-4 bg-yellow-50">
                <label className="block text-neutral-900 text-xs sm:text-sm uppercase tracking-wider mb-2 font-bold font-mono">
                  Repeat
                </label>
                <div className="flex gap-4">
                  {[
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'yearly', label: 'Yearly' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <div className="relative flex items-center">
                        <input
                          type="radio"
                          name="recurrence"
                          value={option.value}
                          checked={item.recurrenceType === option.value}
                          onChange={(e) => setItem({ ...item, recurrenceType: e.target.value })}
                          className="w-5 h-5 border-2 border-neutral-900 appearance-none checked:bg-neutral-900 cursor-pointer"
                        />
                        {item.recurrenceType === option.value && (
                          <div className="w-3 h-3 bg-white absolute inset-0 m-auto pointer-events-none" />
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-mono font-bold">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-2 border-neutral-900 p-4 bg-yellow-50">
                <label className="block text-neutral-900 text-xs sm:text-sm uppercase tracking-wider mb-2 font-bold font-mono">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={item.recurrenceEnd || ''}
                  onChange={(e) => setItem({ ...item, recurrenceEnd: e.target.value })}
                  min={item.date}
                  className="w-full border-4 border-neutral-900 px-3 py-3 text-sm sm:text-base text-neutral-900 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono font-bold"
                />
                <p className="text-xs text-neutral-600 mt-2 font-mono">
                  Leave empty to repeat for 1 year
                </p>
              </div>

              {item.recurrenceType === 'monthly' && item.date && new Date(item.date).getDate() > 28 && (
                <div className="flex items-start gap-2 bg-yellow-100 border-2 border-yellow-600 p-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-900 font-mono">
                    <strong>Note:</strong> On months with fewer days, this will occur on the last day of the month.
                  </p>
                </div>
              )}

              {item.recurrenceType === 'yearly' && item.date && 
               new Date(item.date).getMonth() === 1 && new Date(item.date).getDate() === 29 && (
                <div className="flex items-start gap-2 bg-yellow-100 border-2 border-yellow-600 p-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-900 font-mono">
                    <strong>Note:</strong> On non-leap years, this will occur on February 28th.
                  </p>
                </div>
              )}
            </div>
          )}

          {(isExam || isEvent) && (
              <div>
                <label className="block text-neutral-900 text-xs sm:text-sm uppercase tracking-wider mb-2 font-bold font-mono">
                  Time
                </label>
                <input
                  type="time"
                  value={item.time || ''}
                  onChange={(e) => setItem({ ...item, time: e.target.value })}
                  className="w-full border-4 border-neutral-900 px-3 py-3 text-sm sm:text-base text-neutral-900 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono font-bold"
                />
              </div>
            )}

          {(isExam || isEvent) && (
            <div>
              <label className="block text-neutral-900 text-xs sm:text-sm uppercase tracking-wider mb-2 font-bold font-mono">
                Location
              </label>
              <input
                type="text"
                value={item.location || ''}
                onChange={(e) => setItem({ ...item, location: e.target.value })}
                placeholder={isExam ? 'e.g., Room 301, Main Hall' : 'e.g., Student Center, Downtown'}
                className="w-full border-4 border-neutral-900 px-3 py-3 text-sm sm:text-base text-neutral-900 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono"
              />
            </div>
          )}

          {isAssignment && (
            <div>
              <label className="block text-neutral-900 text-xs sm:text-sm uppercase tracking-wider mb-2 font-bold font-mono">
                Priority
              </label>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {['low', 'medium', 'high'].map(p => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer">
                    <div className="relative">
                      <input
                        type="radio"
                        name="priority"
                        value={p}
                        checked={item.priority === p}
                        onChange={(e) => setItem({ ...item, priority: e.target.value })}
                        className="w-5 h-5 border-2 border-neutral-900 appearance-none checked:bg-neutral-900 cursor-pointer"
                      />
                      {item.priority === p && (
                        <div className="w-3 h-3 bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                      )}
                    </div>
                    <span className="text-xs sm:text-sm capitalize font-mono font-bold">{p}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {isAssignment && (
            <div>
              <label className="block text-neutral-900 text-xs sm:text-sm uppercase tracking-wider mb-2 font-bold font-mono">
                Subtasks / Checklist
              </label>
              <div className="space-y-2 mb-3">
                {item.subtasks && item.subtasks.map((subtask, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-white border-2 border-neutral-900">
                    <span className="text-xs sm:text-sm flex-1 text-neutral-900 break-words font-mono">{subtask.text}</span>
                    <button
                      onClick={() => removeSubtask(idx)}
                      className="text-neutral-900 hover:text-red-600 flex-shrink-0 border-2 border-neutral-900 p-1 hover:border-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
                  placeholder="Add a subtask..."
                  className="flex-1 border-4 border-neutral-900 px-3 py-2 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono"
                />
                <button
                  onClick={addSubtask}
                  className="px-3 sm:px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-700 transition-colors flex-shrink-0 border-2 border-neutral-900"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {isAssignment && (
            <div>
              <label className="block text-neutral-900 text-xs sm:text-sm uppercase tracking-wider mb-2 font-bold font-mono">
                Links & Resources
              </label>
              <div className="space-y-2 mb-3">
                {item.links && item.links.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-white border-2 border-neutral-900">
                    <Link className="w-4 h-4 text-neutral-900 flex-shrink-0" />
                    <div className="flex-1 text-xs sm:text-sm min-w-0">
                      <div className="text-neutral-900 break-words font-mono font-bold">{link.label}</div>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs break-all font-mono">
                        {link.url}
                      </a>
                    </div>
                    <button
                      onClick={() => removeLink(idx)}
                      className="text-neutral-900 hover:text-red-600 flex-shrink-0 border-2 border-neutral-900 p-1 hover:border-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={newLinkLabel}
                  onChange={(e) => setNewLinkLabel(e.target.value)}
                  placeholder="Label (optional)"
                  className="w-full border-4 border-neutral-900 px-3 py-2 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono"
                />
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addLink()}
                    placeholder="https://..."
                    className="flex-1 border-4 border-neutral-900 px-3 py-2 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono"
                  />
                  <button
                    onClick={addLink}
                    className="px-3 sm:px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-700 transition-colors flex-shrink-0 border-2 border-neutral-900"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-neutral-900 text-xs sm:text-sm uppercase tracking-wider mb-2 font-bold font-mono">
              Notes
            </label>
            <textarea
              value={item.notes}
              onChange={(e) => setItem({ ...item, notes: e.target.value })}
              placeholder={
                isAssignment ? 'Additional details, requirements, instructions...' :
                isExam ? 'Topics covered, materials allowed, etc.' :
                'Details, dress code, etc.'
              }
              rows={4}
              className="w-full border-4 border-neutral-900 px-3 py-2 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono"
            />
          </div>
        </div>

        <div className="border-t-4 border-neutral-900 p-4 sm:p-6 flex flex-col sm:flex-row gap-3 sm:gap-4 sticky bottom-0 bg-white">
          <button
            onClick={onCancel}
            className="flex-1 border-2 border-neutral-900 bg-white text-neutral-900 py-2 sm:py-3 text-xs sm:text-sm uppercase tracking-wider font-bold hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all font-mono"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!item.title || !item.date}
            className="flex-1 bg-neutral-900 text-white py-2 sm:py-3 text-xs sm:text-sm uppercase tracking-wider font-bold hover:bg-neutral-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono"
          >
            <Save className="w-4 h-4" />
            Save {isAssignment ? 'Assignment' : isExam ? 'Exam' : 'Event'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Schedule;