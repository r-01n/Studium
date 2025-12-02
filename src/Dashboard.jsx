import React, { useState, useEffect } from 'react';
import { Clock, Dumbbell, Target, Calendar, TrendingUp, CheckSquare, FileText, CalendarDays, ChevronLeft, ChevronRight, DollarSign, BarChart3, X, Plus, CheckCircle2, Circle, MapPin } from 'lucide-react';

const TodayTimeline = ({ events, scheduleEvents, setCurrentModule }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const timelineRef = React.useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to keep NOW line in the middle
  useEffect(() => {
    if (timelineRef.current) {
      const container = timelineRef.current;
      const containerHeight = container.clientHeight;
      const contentHeight = container.scrollHeight;
      const currentTimePos = getCurrentTimePosition();
      
      // Calculate scroll position to center the NOW line
      const targetScroll = (contentHeight * currentTimePos / 100) - (containerHeight / 2);
      container.scrollTop = Math.max(0, targetScroll);
    }
  }, [currentTime]);

  // Filter events for today and expand recurring events
const getTodaysItems = () => {
  const today = new Date();
  const todayDay = today.getDay();
  const todayStr = today.toISOString().split('T')[0];

  // Get timetable events for today
  const timetableItems = events
    .filter(event => {
      if (event.repeatDays && event.repeatDays.length > 0) {
        return event.repeatDays.includes(todayDay);
      }
      return event.day === todayDay;
    })
    .map(event => ({
      ...event,
      id: `timetable-${event.id}-${todayStr}`,
      source: 'timetable',
      startTime: event.startTime,
      endTime: event.endTime
    }));

  // Get schedule items for today (assignments, exams, events)
  const scheduleItems = (scheduleEvents || [])
    .filter(item => item.date === todayStr && item.time)
    .map(item => {
      // Calculate end time (assume 1 hour duration if not specified)
      const [hours, minutes] = item.time.split(':').map(Number);
      const endHour = hours + 1;
      const endTime = `${String(endHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      
      return {
        ...item,
        id: `schedule-${item.id}`,
        source: 'schedule',
        startTime: item.time,
        endTime: endTime,
        title: item.title,
        location: item.location || '',
        category: item.type // assignment, exam, or event
      };
    });

  // Combine and sort by start time
  return [...timetableItems, ...scheduleItems].sort((a, b) => 
    a.startTime.localeCompare(b.startTime)
  );
};

const todaysItems = getTodaysItems();

const getCategoryStyle = (category, source) => {
  // Schedule items (assignments, exams, events)
  if (source === 'schedule') {
    const scheduleStyles = {
      assignment: 'bg-red-100 border-red-600',
      exam: 'bg-orange-100 border-orange-600',
      event: 'bg-blue-100 border-blue-600'
    };
    return scheduleStyles[category] || 'bg-gray-100 border-gray-600';
  }
  
  // Timetable items
  const styles = {
    class: 'bg-blue-100 border-blue-600',
    work: 'bg-purple-100 border-purple-600',
    exercise: 'bg-red-100 border-red-600',
    personal: 'bg-green-100 border-green-600',
    other: 'bg-yellow-100 border-yellow-600'
  };
  return styles[category] || styles.other;
};

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, mins] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(mins).padStart(2, '0')} ${period}`;
  };

  const getTimePosition = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 0 * 60; // 12 AM (midnight)
    const endMinutes = 24 * 60; // 12 AM next day (midnight)
    const relativeMinutes = totalMinutes - startMinutes;
    const totalRange = endMinutes - startMinutes;
    return (relativeMinutes / totalRange) * 100;
  };

  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    return getTimePosition(timeStr);
  };

  const getEventHeight = (startTime, endTime) => {
    const startPos = getTimePosition(startTime);
    const endPos = getTimePosition(endTime);
    return endPos - startPos;
  };

  const isEventCurrent = (item) => {
    const now = currentTime;
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return item.startTime <= currentTimeStr && item.endTime > currentTimeStr;
  };

  const isEventPast = (item) => {
    const now = currentTime;
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return item.endTime <= currentTimeStr;
  };

  // Check for overlapping events
  const getOverlappingGroups = () => {
    const groups = [];
    const processed = new Set();

    todaysItems.forEach((item, idx) => {
      if (processed.has(idx)) return;

      const group = [item];
      processed.add(idx);

      // Find all events that overlap with this one
      for (let i = idx + 1; i < todaysItems.length; i++) {
        if (processed.has(i)) continue;
        
        const other = todaysItems[i];
        const hasOverlap = group.some(e => 
          (other.startTime < e.endTime && other.endTime > e.startTime)
        );

        if (hasOverlap) {
          group.push(other);
          processed.add(i);
        }
      }

      groups.push(group);
    });

    return groups;
  };

  const overlappingGroups = getOverlappingGroups();
  const currentTimePos = getCurrentTimePosition();

  // Generate hour markers
  const hours = Array.from({ length: 24 }, (_, i) => i); // 12 AM to 11 PM (full day)


  if (todaysItems.length === 0) {
    return (
      <div className="bg-white border-2 border-neutral-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="border-b-2 border-neutral-900 p-4">
          <h3 className="text-lg font-serif text-neutral-900">Today's Schedule</h3>
        </div>
        <div className="p-8 text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 text-neutral-400 border-4 border-neutral-900 p-2" />
          <p className="text-sm text-neutral-600 font-mono">No events scheduled today</p>
          <button
            onClick={() => setCurrentModule( 'timetable' ? 'timetable' : 'schedule')}            className="mt-4 px-4 py-2 text-xs border-2 border-neutral-900 bg-white text-neutral-900 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all font-mono font-bold uppercase"
          >
            Add Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-neutral-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="border-b-2 border-neutral-900 p-4 flex items-center justify-between">
        <h3 className="text-lg font-serif text-neutral-900">Today's Schedule</h3>
        <button
          onClick={() => setCurrentModule( 'timetable' ? 'timetable' : 'schedule')}          className="text-xs px-3 py-1 border-2 border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors font-mono font-bold uppercase"
        >
          View All
        </button>
      </div>
      
      <div className="relative overflow-hidden" style={{ height: '100%' }}>

        {/* Scrollable timeline container */}
        <div 
          ref={timelineRef}
          className="absolute inset-0 overflow-y-auto"
          style={{
            scrollbarWidth: 'thin',
          }}
        >
          <div className="relative px-4 py-4" style={{ height: '100%' }}>

            {/* Hour markers */}
            {hours.map((hour) => {
              const position = getTimePosition(`${hour}:00`);
              return (
                <div
                  key={hour}
                  className="absolute left-0 right-0 flex items-center"
                  style={{ top: `${position}%` }}
                >
                  <div className="w-12 text-xs font-mono font-bold text-neutral-600">
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </div>
                  <div className="flex-1 h-px bg-neutral-300"></div>
                </div>
              );
            })}

            {/* Event blocks */}
            <div className="absolute left-12 right-4 top-0 bottom-0">
              {overlappingGroups.map((group, groupIdx) => {
                const groupWidth = 100 / Math.max(group.length, 1);
                
                return group.map((event, eventIdx) => {
                  const topPos = getTimePosition(event.startTime);
                  const height = getEventHeight(event.startTime, event.endTime);
                  const isCurrent = isEventCurrent(event);
                  const isPast = isEventPast(event);
                  const leftOffset = eventIdx * groupWidth;
                  const zIndex = group.length - eventIdx; // Last event on top

                  return (
                    <div
                      key={event.id}
                      className={`absolute border-2 border-neutral-900 p-2 cursor-pointer transition-all ${getCategoryStyle(event.category, event.source)} ${
                        isCurrent ? 'ring-4 ring-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 
                        isPast ? 'opacity-50' : 
                        'hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5'
                      }`}
                      style={{
                        top: `${topPos}%`,
                        height: `${Math.max(height, 8)}%`,
                        left: `${leftOffset}%`,
                        width: `${groupWidth}%`,
                        zIndex: zIndex
                      }}
                      onClick={() => setCurrentModule( 'timetable' ? 'timetable' : 'schedule')}                    >
                      <div className="flex items-start gap-1 mb-1">
                        {event.source === 'schedule' && (
                          <span className="text-xs">
                            {event.category === 'assignment' ? '📝' : event.category === 'exam' ? '📚' : '📅'}
                          </span>
                        )}
                        <div className="text-xs font-bold font-mono uppercase text-neutral-900 truncate flex-1">
                          {event.title}
                        </div>
                      </div>
                      <div className="text-xs font-mono text-neutral-700 mt-1">
                        {formatTime(event.startTime)}
                      </div>
                      {event.location && (
                        <div className="text-xs font-mono text-neutral-600 truncate flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </div>
                      )}
                      {isCurrent && (
                        <div className="absolute top-1 right-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  );
                });
              })}
            </div>

            {/* Current time indicator - NOW line */}
            <div
              className="absolute left-0 right-0 z-20 pointer-events-none"
              style={{ top: `${currentTimePos}%` }}
            >
              <div className="flex items-center">
                <div className="w-12 flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-neutral-900"></div>
                </div>
                <div className="flex-1 h-1 bg-red-500 border-y-2 border-neutral-900 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-red-500 border-2 border-neutral-900 px-2 py-0.5">
                    <span className="text-xs font-mono font-bold text-white">NOW</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ setCurrentModule: setCurrentModuleProp }) => {
  const [internalModule, setInternalModule] = useState('dashboard');
  const setCurrentModule = setCurrentModuleProp || setInternalModule;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todayStats, setTodayStats] = useState({
    pomodorosCompleted: 0,
    habitsCompleted: 0,
    totalHabits: 0,
    workoutsCompleted: 0
  });
  const [assignments, setAssignments] = useState([]);
  const [eventsExams, setEventsExams] = useState([]);
  const [quickTasks, setQuickTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [timetableEvents, setTimetableEvents] = useState([]);
  
  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];
    
    const pomodoros = JSON.parse(localStorage.getItem('pomodoroCompletions') || '[]');
    const todayPomodoros = pomodoros.filter(p => {
      const pDate = new Date(p.timestamp);
      return pDate.toDateString() === today.toDateString();
    });
    
    const habits = JSON.parse(localStorage.getItem('habits') || '[]');
    const habitCompletions = JSON.parse(localStorage.getItem('habitCompletions') || '{}');
    const todayHabits = habitCompletions[todayKey] || {};
    const completedHabitsCount = Object.values(todayHabits).filter(v => v === true || (typeof v === 'number' && v > 0)).length;
    
    const workouts = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
    const todayWorkouts = workouts.filter(w => {
      const wDate = new Date(w.startTime);
      return wDate.toDateString() === today.toDateString();
    });
    
    setTodayStats({
      pomodorosCompleted: todayPomodoros.length,
      habitsCompleted: completedHabitsCount,
      totalHabits: habits.length,
      workoutsCompleted: todayWorkouts.length
    });

    const savedAssignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    const savedEvents = JSON.parse(localStorage.getItem('eventsExams') || '[]');
    const savedQuickTasks = JSON.parse(localStorage.getItem('quickTasks') || '[]');
    
    setAssignments(savedAssignments);
    setEventsExams(savedEvents);
    setQuickTasks(savedQuickTasks);

    const savedTimetableEvents = JSON.parse(localStorage.getItem('timetableEvents') || '[]');
    setTimetableEvents(savedTimetableEvents);
  }, []);

  useEffect(() => {
    localStorage.setItem('quickTasks', JSON.stringify(quickTasks));
  }, [quickTasks]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getItemsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    const assignmentsOnDate = assignments.filter(a => a.deadline === dateStr);
    const eventsOnDate = eventsExams.filter(e => e.date === dateStr);
    
    return { assignments: assignmentsOnDate, events: eventsOnDate };
  };

  const getDaysUntil = (dateStr) => {
    if (!dateStr) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUpcomingItems = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingAssignments = assignments
      .filter(a => a.deadline && new Date(a.deadline) >= today && a.status !== 'completed')
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);
    
    const upcomingEvents = eventsExams
      .filter(e => e.date && new Date(e.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
    
    return [...upcomingAssignments, ...upcomingEvents]
      .sort((a, b) => new Date(a.deadline || a.date) - new Date(b.deadline || b.date))
      .slice(0, 5);
  };
    
  const handleDayClick = (date) => {
    const items = getItemsForDate(date);
    setModalContent({ date, ...items });
  };
    
  const closeModal = () => {
    setModalContent(null);
  };

  const handleItemClick = (isAssignment) => {
    closeModal();
    setCurrentModule('schedule');
  };

  const addQuickTask = (e) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      setQuickTasks([...quickTasks, { 
        id: Date.now(), 
        text: newTaskText.trim(), 
        completed: false 
      }]);
      setNewTaskText('');
    }
  };

  const toggleTask = (id) => {
    setQuickTasks(quickTasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setQuickTasks(quickTasks.filter(task => task.id !== id));
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const upcomingItems = getUpcomingItems();

  const DayModal = () => {
    if (!modalContent) return null;

    const { date, assignments, events } = modalContent;
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const hasItems = assignments.length > 0 || events.length > 0;
    const allItems = [...assignments, ...events].sort((a, b) => {
        const dateA = new Date(a.deadline || a.date);
        const dateB = new Date(b.deadline || b.date);
        return dateA - dateB;
    });

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={closeModal}>
            <div 
                className="bg-white border-2 border-neutral-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md"
                onClick={e => e.stopPropagation()} 
            >
                <div className="flex justify-between items-center p-4 border-b-2 border-neutral-900">
                    <h3 className="text-xl font-serif text-neutral-900">{formattedDate}</h3>
                    <button onClick={closeModal} className="p-2 text-neutral-900 hover:bg-neutral-100 border border-neutral-900">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    {hasItems ? (
                        <div className="space-y-3">
                            {allItems.map((item, index) => {
                                const isAssignment = 'deadline' in item;
                                const itemType = isAssignment ? 'Assignment' : item.type === 'exam' ? 'Exam' : 'Event';
                                const bgColor = isAssignment ? 'bg-red-100' : item.type === 'exam' ? 'bg-orange-100' : 'bg-blue-100';
                                
                                return (
                                    <div 
                                        key={index} 
                                        className={`border-2 border-neutral-900 p-3 ${bgColor} hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer`}
                                        onClick={() => handleItemClick(isAssignment)}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold uppercase text-neutral-900">{itemType}</span>
                                            {item.course && <span className="text-xs font-mono text-neutral-700">{item.course}</span>}
                                        </div>
                                        <p className="text-sm font-medium text-neutral-900">{item.title}</p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-neutral-500">
                            <Calendar className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                            <p className="text-sm font-mono">Nothing scheduled for this day!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col lg:flex-row">
      <DayModal />
      
      {/* Left Sidebar */}
      <div className="w-full lg:w-64 bg-white border-b-2 lg:border-b-0 lg:border-r-2 border-neutral-900 flex-shrink-0 lg:h-screen lg:sticky lg:top-0 lg:overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 flex-shrink-0">
          <h1 className="text-2xl font-serif text-neutral-900 tracking-tight">STUDIUM</h1>
          <p className="text-neutral-600 text-xs mt-1 font-mono uppercase tracking-wider">Productivity Suite</p>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 pb-4 sm:pb-6">
          <nav className="mb-6">
            <div className="flex flex-row lg:flex-col gap-2 lg:space-y-0 whitespace-nowrap lg:whitespace-normal">
              <button onClick={() => setCurrentModule('dashboard')} className="w-auto lg:w-full flex items-center gap-3 px-4 py-3 bg-neutral-900 text-white border-2 border-neutral-900 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Overview</span>
              </button>
              <button onClick={() => setCurrentModule('pomodoro')} className="w-auto lg:w-full flex items-center gap-3 px-4 py-3 text-neutral-900 bg-white border-2 border-neutral-900 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                <Clock className="w-5 h-5" />
                <span>Pomodoro</span>
              </button>
              <button onClick={() => setCurrentModule('schedule')} className="w-auto lg:w-full flex items-center gap-3 px-4 py-3 text-neutral-900 bg-white border-2 border-neutral-900 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                <FileText className="w-5 h-5" />
                <span>Assignments</span>
              </button>
              <button onClick={() => setCurrentModule('schedule')} className="w-auto lg:w-full flex items-center gap-3 px-4 py-3 text-neutral-900 bg-white border-2 border-neutral-900 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                <CalendarDays className="w-5 h-5" />
                <span>Events & Exams</span>
              </button>
              <button onClick={() => setCurrentModule('timetable')} className="w-auto lg:w-full flex items-center gap-3 px-4 py-3 text-neutral-900 bg-white border-2 border-neutral-900 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                <Calendar className="w-5 h-5" />
                <span>Timetable</span>
              </button>
              <button onClick={() => setCurrentModule('finance')} className="w-auto lg:w-full flex items-center gap-3 px-4 py-3 text-neutral-900 bg-white border-2 border-neutral-900 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                <DollarSign className="w-5 h-5" />
                <span>Finance</span>
              </button>
              <button onClick={() => setCurrentModule('workout')} className="w-auto lg:w-full flex items-center gap-3 px-4 py-3 text-neutral-900 bg-white border-2 border-neutral-900 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                <Dumbbell className="w-5 h-5" />
                <span>Workouts</span>
              </button>
              <button onClick={() => setCurrentModule('habits')} className="w-auto lg:w-full flex items-center gap-3 px-4 py-3 text-neutral-900 bg-white border-2 border-neutral-900 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                <Target className="w-5 h-5" />
                <span>Habits</span>
              </button>
              <div className="lg:pt-2 lg:border-t-2 border-neutral-900 lg:mt-2">
                <button onClick={() => setCurrentModule('statistics')} className="w-auto lg:w-full flex items-center gap-3 px-4 py-3 text-neutral-900 bg-white border-2 border-neutral-900 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                  <BarChart3 className="w-5 h-5" />
                  <span>Statistics</span>
                </button>
              </div>
            </div>
          </nav>

          <div className="pt-6 border-t-2 border-neutral-900 hidden lg:block">
            <div className="text-xs uppercase tracking-wider font-mono text-neutral-900 mb-3">Today's Progress</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm border border-neutral-300 p-2">
                <span className="text-neutral-600 font-mono">Pomodoros</span>
                <span className="font-bold text-neutral-900">{todayStats.pomodorosCompleted}</span>
              </div>
              <div className="flex items-center justify-between text-sm border border-neutral-300 p-2">
                <span className="text-neutral-600 font-mono">Habits</span>
                <span className="font-bold text-neutral-900">{todayStats.habitsCompleted}/{todayStats.totalHabits}</span>
              </div>
              <div className="flex items-center justify-between text-sm border border-neutral-300 p-2">
                <span className="text-neutral-600 font-mono">Workouts</span>
                <span className="font-bold text-neutral-900">{todayStats.workoutsCompleted}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto p-4 sm:p-8">
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-serif text-neutral-900 mb-2">Good {getGreeting()}</h2>
            <p className="text-neutral-600 font-mono text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <div className="bg-white border-2 border-neutral-900 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-neutral-900" />
                <span className="text-3xl font-bold text-neutral-900">{todayStats.pomodorosCompleted}</span>
              </div>
              <div className="text-sm text-neutral-600 font-mono uppercase tracking-wide">Focus sessions</div>
            </div>
            <div className="bg-white border-2 border-neutral-900 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-neutral-900" />
                <span className="text-3xl font-bold text-neutral-900">{todayStats.habitsCompleted}/{todayStats.totalHabits}</span>
              </div>
              <div className="text-sm text-neutral-600 font-mono uppercase tracking-wide">Habits completed</div>
            </div>
            <div className="bg-white border-2 border-neutral-900 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-2">
                <Dumbbell className="w-5 h-5 text-neutral-900" />
                <span className="text-3xl font-bold text-neutral-900">{todayStats.workoutsCompleted}</span>
              </div>
              <div className="text-sm text-neutral-600 font-mono uppercase tracking-wide">Workouts done</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="bg-white border-2 border-neutral-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="border-b-2 border-neutral-900 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between mb-4 gap-4">
                    <h3 className="text-2xl font-serif text-neutral-900">
                      {monthNames[month]} {year}
                    </h3>
                    <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                      <button onClick={goToPreviousMonth} className="p-2 border-2 border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={goToToday} className="px-3 py-2 text-sm border-2 border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors font-mono uppercase">
                        Today
                      </button>
                      <button onClick={goToNextMonth} className="p-2 border-2 border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                    {dayNames.map(day => (
                      <div key={day} className="text-center text-xs uppercase tracking-wider font-mono text-neutral-900 py-2 border border-neutral-300">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
                      <div key={`empty-${idx}`} className="aspect-square" />
                    ))}

                    {/* Days of the month */}
                    {Array.from({ length: daysInMonth }).map((_, idx) => {
                      const day = idx + 1;
                      const date = new Date(year, month, day);
                      const isToday = date.toDateString() === new Date().toDateString();
                      const isPast = date < new Date().setHours(0, 0, 0, 0);
                      const { assignments: dayAssignments, events: dayEvents } = getItemsForDate(date);
                      const hasItems = dayAssignments.length > 0 || dayEvents.length > 0;

                      return (
                        <div
                          key={day}
                          onClick={() => handleDayClick(date)}
                          className={`aspect-square border-2 p-1 sm:p-2 relative cursor-pointer transition-all ${
                            isToday 
                              ? 'border-neutral-900 bg-neutral-900 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                              : isPast
                              ? 'border-neutral-300 bg-neutral-100 text-neutral-400'
                              : 'border-neutral-900 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5'
                          }`}
                        >
                          <div className={`text-xs sm:text-sm font-bold ${isToday ? 'text-white' : 'text-neutral-900'}`}>
                            {day}
                          </div>
                          {hasItems && (
                            <div className="absolute bottom-1 sm:bottom-2 left-1 right-1 flex items-center justify-center gap-1">
                              {dayAssignments.length > 0 && (
                                <div className="w-2 h-2 bg-red-500 border border-neutral-900" title={`${dayAssignments.length} assignment(s)`} />
                              )}
                              {dayEvents.length > 0 && (
                                <div className="w-2 h-2 bg-blue-500 border border-neutral-900" title={`${dayEvents.length} event(s)`} />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex gap-6 mt-4 pt-4 border-t-2 border-neutral-900">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 border border-neutral-900" />
                      <span className="text-xs text-neutral-900 font-mono uppercase">Assignments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 border border-neutral-900" />
                      <span className="text-xs text-neutral-900 font-mono uppercase">Events/Exams</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Upcoming and Quick Tasks Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                {/* Upcoming Items */}
                <div className="bg-white border-2 border-neutral-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
<div className="border-b-2 border-neutral-900 p-4">
                  <h3 className="text-lg font-serif text-neutral-900">Upcoming</h3>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                  {upcomingItems.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                      <p className="text-sm font-mono">Nothing upcoming</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingItems.map(item => {
                        const isAssignment = 'deadline' in item;
                        const dateStr = isAssignment ? item.deadline : item.date;
                        const daysUntil = getDaysUntil(dateStr);
                        
                        return (
                          <div
                            key={item.id}
                            className="border-2 border-neutral-900 p-3 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
                            onClick={() => setCurrentModule('schedule')}
                          >
                            <div className="flex items-start gap-2 mb-1">
                              {isAssignment ? (
                                <div className="w-2 h-2 bg-red-500 border border-neutral-900 flex-shrink-0 mt-1.5" />
                              ) : item.type === 'exam' ? (
                                <div className="w-2 h-2 bg-orange-500 border border-neutral-900 flex-shrink-0 mt-1.5" />
                              ) : (
                                <div className="w-2 h-2 bg-blue-500 border border-neutral-900 flex-shrink-0 mt-1.5" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-neutral-900 truncate">
                                  {item.title}
                                </div>
                                <div className="text-xs text-neutral-600 font-mono">
                                  {daysUntil === 0 ? 'TODAY' : daysUntil === 1 ? 'TOMORROW' : `IN ${daysUntil} DAYS`}
                                </div>
                                {item.course && (
                                  <div className="text-xs text-neutral-600 mt-1 font-mono">{item.course}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>                </div>

                {/* Quick Tasks */}
                <div className="bg-white border-2 border-neutral-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <div className="border-b-2 border-neutral-900 p-4">
                  <h3 className="text-lg font-serif text-neutral-900">Quick Tasks</h3>
                </div>
                <div className="p-4">
                  <form onSubmit={addQuickTask} className="mb-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        placeholder="Add a quick task..."
                        className="flex-1 px-3 py-2 border-2 border-neutral-900 font-mono text-sm focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      />
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-neutral-900 text-white border-2 border-neutral-900 hover:bg-neutral-700 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {quickTasks.map(task => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 p-2 border border-neutral-300 hover:border-neutral-900 transition-colors group"
                      >
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="flex-shrink-0"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-neutral-900" />
                          ) : (
                            <Circle className="w-5 h-5 text-neutral-400" />
                          )}
                        </button>
                        <span className={`flex-1 text-sm font-mono ${task.completed ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
                          {task.text}
                        </span>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-neutral-900"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {quickTasks.length === 0 && (
                      <div className="text-center py-4 text-neutral-500">
                        <p className="text-sm font-mono">No tasks yet</p>
                      </div>
                    )}
                  </div>
                </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
                {/* Today's Timeline */}
                <TodayTimeline 
                  events={timetableEvents} 
                  scheduleEvents={[...assignments, ...eventsExams]} 
                  setCurrentModule={setCurrentModule} 
                />
            </div>
          </div>
        </div>
      </div>
  );
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
}

export default Dashboard; 