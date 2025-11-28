import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Home, TrendingUp, Calendar, Check, X, Edit2, ChevronLeft, ChevronRight, BarChart3, Target, Flame, Sparkles } from 'lucide-react';

const Habits = ({ setCurrentModule }) => {
  const [view, setView] = useState('today');
  const [habits, setHabits] = useState(null);
  const [completions, setCompletions] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const savedHabits = localStorage.getItem('habits');
    const savedCompletions = localStorage.getItem('habitCompletions');
    
    const loadedHabits = savedHabits ? JSON.parse(savedHabits) : [];
    const loadedCompletions = savedCompletions ? JSON.parse(savedCompletions) : {};
    
    setHabits(loadedHabits);
    setCompletions(loadedCompletions);
  }, []);

  useEffect(() => {
    if (habits === null) return;
    try {
      localStorage.setItem('habits', JSON.stringify(habits));
    } catch (e) {
      console.error('Error saving habits:', e);
    }
  }, [habits]);

  useEffect(() => {
    if (completions === null) return;
    try {
      localStorage.setItem('habitCompletions', JSON.stringify(completions));
    } catch (e) {
      console.error('Error saving completions:', e);
    }
  }, [completions]);

  if (habits === null || completions === null) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-center border-4 border-neutral-900 bg-white p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-6xl mb-4">⏳</div>
          <div className="text-neutral-900 font-mono font-bold uppercase tracking-wider">Loading...</div>
        </div>
      </div>
    );
  }

  if (view === 'today') {
    return <TodayView 
      habits={habits}
      completions={completions}
      setCompletions={setCompletions}
      selectedDate={selectedDate}
      setView={setView}
      setCurrentModule={setCurrentModule}
    />;
  }

  if (view === 'calendar') {
    return <CalendarView
      habits={habits}
      completions={completions}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      setView={setView}
      setCurrentModule={setCurrentModule}
    />;
  }

  if (view === 'analytics') {
    return <AnalyticsView
      habits={habits}
      completions={completions}
      setView={setView}
      setCurrentModule={setCurrentModule}
    />;
  }

  if (view === 'manage') {
    return <ManageHabits
      habits={habits}
      setHabits={setHabits}
      setView={setView}
      setCurrentModule={setCurrentModule}
    />;
  }
};

const TodayView = ({ habits, completions, setCompletions, selectedDate, setView, setCurrentModule }) => {
  const dateKey = selectedDate.toISOString().split('T')[0];
  
  const getTodayCompletions = () => {
    return completions[dateKey] || {};
  };

  const toggleHabit = (habitId) => {
    const todayData = getTodayCompletions();
    const newCompletions = {
      ...completions,
      [dateKey]: {
        ...todayData,
        [habitId]: !todayData[habitId]
      }
    };
    setCompletions(newCompletions);
    try {
      localStorage.setItem('habitCompletions', JSON.stringify(newCompletions));
    } catch (e) {
      console.error('Error saving completion:', e);
    }
  };

  const updateQuantity = (habitId, value) => {
    const todayData = getTodayCompletions();
    const newCompletions = {
      ...completions,
      [dateKey]: {
        ...todayData,
        [habitId]: value
      }
    };
    setCompletions(newCompletions);
    try {
      localStorage.setItem('habitCompletions', JSON.stringify(newCompletions));
    } catch (e) {
      console.error('Error saving completion:', e);
    }
  };

  const getStreak = (habitId) => {
    let streak = 0;
    const today = new Date(selectedDate);
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const key = checkDate.toISOString().split('T')[0];
      
      if (completions[key]?.[habitId]) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const todayData = getTodayCompletions();
  const completedCount = Object.values(todayData).filter(v => v === true || (typeof v === 'number' && v > 0)).length;
  const completionRate = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  const isToday = dateKey === new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
        <button
          onClick={() => setCurrentModule('dashboard')}
          className="flex items-center gap-2 text-neutral-900 hover:bg-neutral-200 mb-6 transition-colors px-3 py-2 border-2 border-neutral-900"
          aria-label="Back to Dashboard"
        >
          <Home className="w-4 h-4" />
          <span className="text-sm uppercase tracking-wider font-mono font-bold">Dashboard</span>
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-neutral-900 uppercase">
              {isToday ? 'TODAY' : selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toUpperCase()}
            </h1>
            <Target className="w-6 h-6 text-neutral-900" />
          </div>
          <p className="text-neutral-700 mb-6 text-base sm:text-lg font-mono uppercase tracking-wide">
            {completedCount} / {habits.length} Complete · {completionRate}%
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setView('calendar')}
            className="flex items-center gap-2 border-2 border-neutral-900 bg-white text-neutral-900 px-4 py-3 text-sm uppercase tracking-wider font-bold hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all font-mono"
            title="Calendar View"
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </button>
          <button
            onClick={() => setView('analytics')}
            className="flex items-center gap-2 border-2 border-neutral-900 bg-white text-neutral-900 px-4 py-3 text-sm uppercase tracking-wider font-bold hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all font-mono"
            title="Analytics"
          >
            <BarChart3 className="w-4 h-4" />
            Stats
          </button>
          <button
            onClick={() => setView('manage')}
            className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-3 text-sm uppercase tracking-wider font-bold border-2 border-neutral-900 hover:bg-neutral-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono"
          >
            <Plus className="w-4 h-4" />
            Manage
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="border-4 border-neutral-900 bg-white p-12 sm:p-16 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <Target className="w-20 h-20 text-neutral-900 mx-auto mb-4 border-4 border-neutral-900 p-3" />
            <h3 className="text-2xl sm:text-3xl font-serif text-neutral-900 mb-3 uppercase">No Habits Yet</h3>
            <p className="text-neutral-700 mb-6 font-mono uppercase tracking-wide">Create your first habit to start</p>
            <button
              onClick={() => setView('manage')}
              className="bg-neutral-900 text-white px-6 py-3 text-sm uppercase tracking-wider font-bold hover:bg-neutral-700 transition-all border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono"
            >
              Create Habit
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => {
              const streak = getStreak(habit.id);
              const value = todayData[habit.id];
              
              return (
                <div key={habit.id} className="border-2 border-neutral-900 bg-white p-4 sm:p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                  <div className="flex items-start gap-4">
                    {habit.type === 'binary' && (
                      <button
                        onClick={() => toggleHabit(habit.id)}
                        className="flex-shrink-0 mt-1"
                      >
                        <div className={`w-10 h-10 border-4 transition-all duration-200 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                          value 
                            ? 'border-neutral-900 bg-neutral-900' 
                            : 'border-neutral-900 hover:bg-neutral-100'
                        }`}>
                          {value && (
                            <Check className="w-full h-full text-white p-1" strokeWidth={4} />
                          )}
                        </div>
                      </button>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-neutral-900 font-mono uppercase truncate">{habit.name}</h3>
                          {habit.description && (
                            <p className="text-sm text-neutral-600 mt-1 font-mono">{habit.description}</p>
                          )}
                        </div>
                        {streak > 0 && (
                          <div className="ml-4 flex-shrink-0 border-2 border-neutral-900 bg-orange-100 px-3 py-2">
                            <div className="flex items-center gap-2">
                              <Flame className="w-5 h-5 text-orange-600" />
                              <div className="text-xl font-bold text-neutral-900 font-mono">{streak}</div>
                            </div>
                            <div className="text-xs uppercase tracking-wider text-neutral-700 font-mono font-bold">Streak</div>
                          </div>
                        )}
                      </div>

                      {habit.type === 'quantity' && (
                        <div className="border-2 border-neutral-900 p-3 bg-neutral-50">
                          <div className="flex items-center gap-4">
                            <input
                              type="number"
                              step="0.1"
                              value={value || ''}
                              onChange={(e) => updateQuantity(habit.id, parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="w-32 border-2 border-neutral-900 bg-white px-3 py-2 text-lg text-neutral-900 focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono font-bold"
                            />
                            <span className="text-neutral-900 font-mono font-bold uppercase">{habit.unit}</span>
                            {habit.target && (
                              <span className="text-neutral-600 text-sm font-mono">
                                Target: {habit.target} {habit.unit}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {habit.type === 'time' && (
                        <div className="border-2 border-neutral-900 p-3 bg-neutral-50">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={Math.floor((value || 0) / 60)}
                                onChange={(e) => {
                                  const hours = parseInt(e.target.value) || 0;
                                  const minutes = (value || 0) % 60;
                                  updateQuantity(habit.id, hours * 60 + minutes);
                                }}
                                placeholder="0"
                                className="w-20 border-2 border-neutral-900 bg-white px-3 py-2 text-lg text-neutral-900 focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono font-bold"
                              />
                              <span className="text-neutral-900 font-mono font-bold uppercase">Hours</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={(value || 0) % 60}
                                onChange={(e) => {
                                  const hours = Math.floor((value || 0) / 60);
                                  const minutes = parseInt(e.target.value) || 0;
                                  updateQuantity(habit.id, hours * 60 + minutes);
                                }}
                                placeholder="0"
                                className="w-20 border-2 border-neutral-900 bg-white px-3 py-2 text-lg text-neutral-900 focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono font-bold"
                              />
                              <span className="text-neutral-900 font-mono font-bold uppercase">Min</span>
                            </div>
                          </div>
                          {(habit.targetHours || habit.targetMinutes) && (
                            <span className="text-neutral-600 text-sm font-mono">
                              Target: {habit.targetHours || 0}h {habit.targetMinutes || 0}m
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const CalendarView = ({ habits, completions, selectedDate, setSelectedDate, setView, setCurrentModule }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedHabit, setSelectedHabit] = useState(null);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getCompletionForDay = (date, habitId) => {
    if (!date) return null;
    const key = date.toISOString().split('T')[0];
    return completions[key]?.[habitId];
  };

  const getCompletionRate = (date) => {
    if (!date) return 0;
    const key = date.toISOString().split('T')[0];
    const dayData = completions[key] || {};
    const completed = Object.values(dayData).filter(v => v === true || (typeof v === 'number' && v > 0)).length;
    return habits.length > 0 ? (completed / habits.length) : 0;
  };

  const days = getDaysInMonth(currentMonth);
  const habitToShow = selectedHabit ? habits.find(h => h.id === selectedHabit) : null;

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

        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-end justify-between border-b-4 border-neutral-900 pb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-neutral-900 uppercase">Calendar</h1>
              <Calendar className="w-6 h-6 text-neutral-900" />
            </div>
            <p className="text-neutral-700 text-base sm:text-lg font-mono uppercase tracking-wide">Track consistency</p>
          </div>
          <button
            onClick={() => setView('today')}
            className="mt-4 sm:mt-0 bg-neutral-900 text-white px-4 py-3 text-sm uppercase tracking-wider font-bold hover:bg-neutral-700 transition-all border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono"
          >
            ← Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="border-2 border-neutral-900 bg-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] lg:sticky lg:top-8">
              <h3 className="text-sm uppercase tracking-wider text-neutral-900 mb-4 font-bold font-mono border-b-2 border-neutral-900 pb-2">Filter</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedHabit(null)}
                  className={`w-full text-left px-3 py-2 text-sm transition-all border-2 border-neutral-900 font-mono font-bold uppercase ${
                    !selectedHabit ? 'bg-neutral-900 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5'
                  }`}
                >
                  All Habits
                </button>
                {habits.map(habit => (
                  <button
                    key={habit.id}
                    onClick={() => setSelectedHabit(habit.id)}
                    className={`w-full text-left px-3 py-2 text-sm transition-all border-2 border-neutral-900 font-mono font-bold uppercase truncate ${
                      selectedHabit === habit.id ? 'bg-neutral-900 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5'
                    }`}
                  >
                    {habit.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="border-2 border-neutral-900 bg-white p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-6 border-b-2 border-neutral-900 pb-4">
                <h2 className="text-xl sm:text-2xl font-serif text-neutral-900 uppercase">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() - 1);
                      setCurrentMonth(newMonth);
                    }}
                    className="border-2 border-neutral-900 text-neutral-900 p-2 hover:bg-neutral-900 hover:text-white transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date())}
                    className="border-2 border-neutral-900 text-neutral-900 px-3 py-2 text-sm hover:bg-neutral-900 hover:text-white transition-all font-mono font-bold uppercase hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() + 1);
                      setCurrentMonth(newMonth);
                    }}
                    className="border-2 border-neutral-900 text-neutral-900 p-2 hover:bg-neutral-900 hover:text-white transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-3">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                  <div key={day} className="text-center text-xs uppercase tracking-wider text-neutral-900 py-2 font-mono font-bold border-b-2 border-neutral-900">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {days.map((day, idx) => {
                  if (!day) {
                    return <div key={idx} className="aspect-square" />;
                  }

                  const isToday = day.toDateString() === new Date().toDateString();
                  let intensity = 0;
                  
                  if (selectedHabit) {
                    const value = getCompletionForDay(day, selectedHabit);
                    if (value === true || (typeof value === 'number' && value > 0)) {
                      intensity = 1;
                    }
                  } else {
                    intensity = getCompletionRate(day);
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedDate(day);
                        setView('today');
                      }}
                      className={`aspect-square border-2 transition-all flex items-center justify-center relative font-mono font-bold hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 ${
                        isToday ? 'border-4 border-neutral-900' : 'border-neutral-900'
                      } ${
                        intensity === 0 ? 'bg-white' :
                        intensity < 0.33 ? 'bg-green-200' :
                        intensity < 0.66 ? 'bg-green-400' :
                        'bg-green-600'
                      }`}
                    >
                      <span className={`text-sm ${intensity > 0.5 ? 'text-white' : 'text-neutral-900'}`}>
                        {day.getDate()}
                      </span>
                      {intensity === 1 && (
                        <Check className="w-4 h-4 text-white absolute top-0.5 right-0.5" strokeWidth={3} />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t-2 border-neutral-900">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-900 font-mono font-bold uppercase text-xs">Less</span>
                    <div className="flex gap-1">
                      <div className="w-6 h-6 border-2 border-neutral-900 bg-white" />
                      <div className="w-6 h-6 border-2 border-neutral-900 bg-green-200" />
                      <div className="w-6 h-6 border-2 border-neutral-900 bg-green-400" />
                      <div className="w-6 h-6 border-2 border-neutral-900 bg-green-600" />
                    </div>
                    <span className="text-neutral-900 font-mono font-bold uppercase text-xs">More</span>
                  </div>
                  {habitToShow && (
                    <div className="border-2 border-neutral-900 bg-yellow-100 px-3 py-2">
                      <span className="text-neutral-900 font-mono font-bold uppercase text-xs">Filter: {habitToShow.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalyticsView = ({ habits, completions, setView, setCurrentModule }) => {
  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const getHabitStats = (habitId) => {
    const last30 = getLast30Days();
    let completed = 0;
    let totalValue = 0;
    let longestStreak = 0;
    let currentStreak = 0;

    const habit = habits.find(h => h.id === habitId);
    
    Object.keys(completions).forEach(date => {
      const value = completions[date][habitId];
      if (value === true || (typeof value === 'number' && value > 0)) {
        if (last30.includes(date)) completed++;
        if (typeof value === 'number') totalValue += value;
      }
    });

    for (let i = 0; i < 365; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      
      if (completions[key]?.[habitId]) {
        currentStreak++;
        if (currentStreak > longestStreak) longestStreak = currentStreak;
      } else if (i === 0) {
        continue;
      } else {
        if (currentStreak > longestStreak) longestStreak = currentStreak;
        currentStreak = 0;
      }
    }

    const completionRate = (completed / 30) * 100;

    return {
      habit,
      completed,
      completionRate,
      currentStreak,
      longestStreak,
      averageValue: habit.type !== 'binary' ? (totalValue / completed || 0) : null
    };
  };

  const stats = habits.map(h => getHabitStats(h.id)).sort((a, b) => b.completionRate - a.completionRate);
  const overallRate = stats.length > 0 
    ? Math.round(stats.reduce((sum, s) => sum + s.completionRate, 0) / stats.length)
    : 0;

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
        <button
          onClick={() => setCurrentModule('dashboard')}
          className="flex items-center gap-2 text-neutral-900 hover:bg-neutral-200 mb-6 transition-colors px-3 py-2 border-2 border-neutral-900"
        >
          <Home className="w-4 h-4" />
          <span className="text-sm uppercase tracking-wider font-mono font-bold">Dashboard</span>
        </button>

        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-end justify-between border-b-4 border-neutral-900 pb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-neutral-900 uppercase">Analytics</h1>
              <BarChart3 className="w-6 h-6 text-neutral-900" />
            </div>
            <p className="text-neutral-700 text-base sm:text-lg font-mono uppercase tracking-wide">Last 30 Days</p>
          </div>
          <button
            onClick={() => setView('today')}
            className="mt-4 sm:mt-0 bg-neutral-900 text-white px-4 py-3 text-sm uppercase tracking-wider font-bold hover:bg-neutral-700 transition-all border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono"
          >
            ← Back
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <div className="border-2 border-neutral-900 bg-white p-4 sm:p-6 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="text-5xl sm:text-6xl font-bold text-neutral-900 mb-3 font-mono">{overallRate}%</div>
            <div className="text-xs sm:text-sm uppercase tracking-wider text-neutral-700 font-bold font-mono border-t-2 border-neutral-900 pt-3">Overall</div>
          </div>
          <div className="border-2 border-neutral-900 bg-white p-4 sm:p-6 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="text-5xl sm:text-6xl font-bold text-neutral-900 mb-3 font-mono">{habits.length}</div>
            <div className="text-xs sm:text-sm uppercase tracking-wider text-neutral-700 font-bold font-mono border-t-2 border-neutral-900 pt-3">Active</div>
          </div>
          <div className="border-2 border-neutral-900 bg-white p-4 sm:p-6 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" />
              <div className="text-5xl sm:text-6xl font-bold text-neutral-900 font-mono">
                {Math.max(...stats.map(s => s.longestStreak), 0)}
              </div>
            </div>
            <div className="text-xs sm:text-sm uppercase tracking-wider text-neutral-700 font-bold font-mono border-t-2 border-neutral-900 pt-3">Best Streak</div>
          </div>
        </div>

        <div className="border-2 border-neutral-900 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-2 border-neutral-900 p-4 sm:p-6 bg-neutral-900">
            <h2 className="text-xl sm:text-2xl font-serif text-white uppercase">Performance</h2>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            {stats.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-neutral-400 mx-auto mb-4 border-4 border-neutral-900 p-2" />
                <p className="text-neutral-500 font-mono uppercase">No data yet</p>
              </div>
            ) : (
              stats.map(stat => (
                <div key={stat.habit.id} className="border-2 border-neutral-900 p-4 bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                  <div className="flex items-start justify-between mb-3 pb-3 border-b-2 border-neutral-900">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-neutral-900 font-mono uppercase">{stat.habit.name}</h3>
                      <p className="text-sm text-neutral-700 font-mono mt-1">
                        {stat.completed}/30 days · {Math.round(stat.completionRate)}%
                      </p>
                    </div>
                    <div className="flex items-center gap-2 border-2 border-neutral-900 bg-orange-100 px-3 py-2">
                      <Flame className="w-5 h-5 text-orange-600" />
                      <div className="text-2xl font-bold text-neutral-900 font-mono">{stat.currentStreak}</div>
                    </div>
                  </div>

                  <div className="relative h-4 bg-neutral-200 border-2 border-neutral-900 overflow-hidden mb-4">
                    <div 
                      className="absolute inset-y-0 left-0 bg-green-500 transition-all duration-700"
                      style={{ width: `${stat.completionRate}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center text-sm">
                    <div className="border-2 border-neutral-900 p-2 bg-neutral-50">
                      <div className="text-neutral-900 font-bold font-mono text-lg">{stat.longestStreak}</div>
                      <div className="text-neutral-700 text-xs font-mono font-bold uppercase">Best</div>
                    </div>
                    {stat.averageValue !== null && (
                      <div className="border-2 border-neutral-900 p-2 bg-neutral-50">
                        <div className="text-neutral-900 font-bold font-mono text-lg">{stat.averageValue.toFixed(1)}</div>
                        <div className="text-neutral-700 text-xs font-mono font-bold uppercase">Avg {stat.habit.unit || 'min'}</div>
                      </div>
                    )}
                    <div className="border-2 border-neutral-900 p-2 bg-neutral-50">
                      <div className="text-neutral-900 font-bold font-mono text-lg">{30 - stat.completed}</div>
                      <div className="text-neutral-700 text-xs font-mono font-bold uppercase">Missed</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ManageHabits = ({ habits, setHabits, setView, setCurrentModule }) => {
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    type: 'binary',
    unit: '',
    target: ''
  });

  const addHabit = () => {
    if (!newHabit.name.trim()) return;
    
    const habit = {
      id: Date.now(),
      ...newHabit,
      createdAt: new Date().toISOString()
    };
    
    const updatedHabits = [...habits, habit];
    setHabits(updatedHabits);
    
    try {
      localStorage.setItem('habits', JSON.stringify(updatedHabits));
    } catch (e) {
      console.error('Error saving habit:', e);
    }
    
    setNewHabit({
      name: '',
      description: '',
      type: 'binary',
      unit: '',
      target: ''
    });
  };

  const deleteHabit = (id) => {
    const updatedHabits = habits.filter(h => h.id !== id);
    setHabits(updatedHabits);
    
    try {
      localStorage.setItem('habits', JSON.stringify(updatedHabits));
    } catch (e) {
      console.error('Error saving habits:', e);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
        <button
          onClick={() => setCurrentModule('dashboard')}
          className="flex items-center gap-2 text-neutral-900 hover:bg-neutral-200 mb-6 transition-colors px-3 py-2 border-2 border-neutral-900"
        >
          <Home className="w-4 h-4" />
          <span className="text-sm uppercase tracking-wider font-mono font-bold">Dashboard</span>
        </button>

        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-end justify-between border-b-4 border-neutral-900 pb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-neutral-900 uppercase">Manage</h1>
              <Sparkles className="w-6 h-6 text-neutral-900" />
            </div>
            <p className="text-neutral-700 text-base sm:text-lg font-mono uppercase tracking-wide">Create & organize</p>
          </div>
          <button
            onClick={() => setView('today')}
            className="mt-4 sm:mt-0 bg-neutral-900 text-white px-4 py-3 text-sm uppercase tracking-wider font-bold hover:bg-neutral-700 transition-all border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono"
          >
            ← Back
          </button>
        </div>

        <div className="border-2 border-neutral-900 bg-white p-4 sm:p-6 mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-2 border-neutral-900 pb-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-serif text-neutral-900 uppercase">Add New Habit</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-neutral-900 text-sm uppercase tracking-wider mb-2 font-bold font-mono">Habit Name *</label>
              <input
                type="text"
                value={newHabit.name}
                onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                placeholder="e.g., MORNING RUN, READ, DRINK WATER"
                className="w-full border-4 border-neutral-900 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono font-bold uppercase"
              />
            </div>

            <div>
              <label className="block text-neutral-900 text-sm uppercase tracking-wider mb-2 font-bold font-mono">Description (Optional)</label>
              <input
                type="text"
                value={newHabit.description}
                onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                placeholder="Why is this important?"
                className="w-full border-4 border-neutral-900 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-900 text-sm uppercase tracking-wider mb-3 font-bold font-mono">Type *</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setNewHabit({ ...newHabit, type: 'binary' })}
                  className={`p-4 border-2 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 ${
                    newHabit.type === 'binary' 
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                      : 'border-neutral-900 bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  <div className="font-bold mb-2 font-mono uppercase text-sm">✓ Checkbox</div>
                  <div className="text-xs opacity-75 font-mono">Done / Not Done</div>
                </button>
                <button
                  onClick={() => setNewHabit({ ...newHabit, type: 'quantity' })}
                  className={`p-4 border-2 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 ${
                    newHabit.type === 'quantity' 
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                      : 'border-neutral-900 bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  <div className="font-bold mb-2 font-mono uppercase text-sm"># Quantity</div>
                  <div className="text-xs opacity-75 font-mono">Track numbers</div>
                </button>
                <button
                  onClick={() => setNewHabit({ ...newHabit, type: 'time' })}
                  className={`p-4 border-2 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 ${
                    newHabit.type === 'time' 
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                      : 'border-neutral-900 bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  <div className="font-bold mb-2 font-mono uppercase text-sm">⏱ Time</div>
                  <div className="text-xs opacity-75 font-mono">Hours & minutes</div>
                </button>
              </div>
            </div>

            {newHabit.type === 'quantity' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-2 border-neutral-900 p-4 bg-neutral-50">
                <div>
                  <label className="block text-neutral-900 text-sm uppercase tracking-wider mb-2 font-bold font-mono">Unit *</label>
                  <input
                    type="text"
                    value={newHabit.unit}
                    onChange={(e) => setNewHabit({ ...newHabit, unit: e.target.value })}
                    placeholder="GLASSES, LBS, KM"
                    className="w-full border-2 border-neutral-900 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-neutral-900 text-sm uppercase tracking-wider mb-2 font-bold font-mono">Target</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newHabit.target}
                    onChange={(e) => setNewHabit({ ...newHabit, target: e.target.value })}
                    placeholder="0"
                    className="w-full border-2 border-neutral-900 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono font-bold"
                  />
                </div>
              </div>
            )}

            {newHabit.type === 'time' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-2 border-neutral-900 p-4 bg-neutral-50">
                <div>
                  <label className="block text-neutral-900 text-sm uppercase tracking-wider mb-2 font-bold font-mono">Target Hours</label>
                  <input
                    type="number"
                    value={newHabit.targetHours || ''}
                    onChange={(e) => setNewHabit({ ...newHabit, targetHours: e.target.value })}
                    placeholder="0"
                    className="w-full border-2 border-neutral-900 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-neutral-900 text-sm uppercase tracking-wider mb-2 font-bold font-mono">Target Minutes</label>
                  <input
                    type="number"
                    value={newHabit.targetMinutes || ''}
                    onChange={(e) => setNewHabit({ ...newHabit, targetMinutes: e.target.value })}
                    placeholder="0"
                    className="w-full border-2 border-neutral-900 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono font-bold"
                  />
                </div>
              </div>
            )}

            <button
              onClick={addHabit}
              disabled={!newHabit.name.trim()}
              className="w-full bg-neutral-900 text-white py-4 text-sm uppercase tracking-wider font-bold hover:bg-neutral-700 transition-all flex items-center justify-center gap-2 border-2 border-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
            >
              <Plus className="w-5 h-5" />
              Add Habit
            </button>
          </div>
        </div>

        <div className="border-2 border-neutral-900 bg-white p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-2 border-neutral-900 pb-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-serif text-neutral-900 uppercase">Your Habits ({habits.length})</h2>
          </div>
          
          {habits.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-neutral-900">
              <Target className="w-16 h-16 text-neutral-400 mx-auto mb-4 border-4 border-neutral-900 p-2" />
              <p className="text-neutral-500 font-mono uppercase tracking-wide">No habits yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => (
                <div key={habit.id} className="border-2 border-neutral-900 p-4 flex items-start justify-between hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all bg-white">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-neutral-900 mb-1 font-mono uppercase truncate">{habit.name}</h3>
                    {habit.description && (
                      <p className="text-sm text-neutral-600 mb-2 font-mono">{habit.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-900">
                      <span className="px-2 py-1 bg-neutral-900 text-white border-2 border-neutral-900 text-xs uppercase tracking-wider font-mono font-bold">
                        {habit.type === 'binary' ? '✓ CHECK' : habit.type === 'quantity' ? '# QUANTITY' : '⏱ TIME'}
                      </span>
                      {habit.type !== 'binary' && habit.target && (
                        <span className="px-2 py-1 border-2 border-neutral-900 bg-white text-xs uppercase font-mono font-bold">
                          Target: {habit.target} {habit.unit || 'min'}
                        </span>
                      )}
                      {habit.type === 'time' && (habit.targetHours || habit.targetMinutes) && (
                        <span className="px-2 py-1 border-2 border-neutral-900 bg-white text-xs uppercase font-mono font-bold">
                          Target: {habit.targetHours || 0}h {habit.targetMinutes || 0}m
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="ml-4 flex-shrink-0 border-2 border-neutral-900 bg-white text-neutral-900 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Habits;