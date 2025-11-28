import React, { useState, useEffect } from 'react';
import { Home, Plus, Trash2, Clock, Edit2, Save, X, ChevronLeft, ChevronRight, Calendar, MapPin, Sparkles } from 'lucide-react';

const Timetable = ({ setCurrentModule }) => {
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentDay, setCurrentDay] = useState(new Date().getDay());
  const [view, setView] = useState('today');

  useEffect(() => {
    const savedEvents = localStorage.getItem('timetableEvents');
    setEvents(savedEvents ? JSON.parse(savedEvents) : []);
  }, []);

  useEffect(() => {
    if (events === null) return;
    localStorage.setItem('timetableEvents', JSON.stringify(events));
  }, [events]);

  const createNewEvent = (day = null) => {
    setEditingEvent({
      id: Date.now(),
      title: '',
      day: day !== null ? day : currentDay,
      startTime: '09:00',
      endTime: '10:00',
      category: 'class',
      location: '',
      notes: '',
      repeatDays: []
    });
    setShowEventModal(true);
  };

  const saveEvent = () => {
    if (!editingEvent.title.trim()) return;
    
    if (editingEvent.id && events.find(e => e.id === editingEvent.id)) {
      setEvents(events.map(e => e.id === editingEvent.id ? editingEvent : e));
    } else {
      setEvents([...events, editingEvent]);
    }
    setShowEventModal(false);
    setEditingEvent(null);
  };

  const deleteEvent = (id) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const getEventsForDay = (dayIndex) => {
    return events
      .filter(e => {
        // Show event if it's on this day OR if this day is in its repeat days
        if (e.repeatDays && e.repeatDays.length > 0) {
          return e.repeatDays.includes(dayIndex);
        }
        return e.day === dayIndex;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getCategoryStyle = (category) => {
    const styles = {
      class: 'bg-blue-100 border-blue-600',
      work: 'bg-purple-100 border-purple-600',
      exercise: 'bg-red-100 border-red-600',
      personal: 'bg-green-100 border-green-600',
      other: 'bg-yellow-100 border-yellow-600'
    };
    return styles[category] || styles.other;
  };

  const getCategoryColor = (category) => {
    const colors = {
      class: 'bg-blue-600',
      work: 'bg-purple-600',
      exercise: 'bg-red-600',
      personal: 'bg-green-600',
      other: 'bg-yellow-600'
    };
    return colors[category] || colors.other;
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, mins] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(mins).padStart(2, '0')} ${period}`;
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayEvents = getEventsForDay(currentDay);
  const today = new Date().getDay();

  const goToPreviousDay = () => {
    setCurrentDay((currentDay - 1 + 7) % 7);
  };

  const goToNextDay = () => {
    setCurrentDay((currentDay + 1) % 7);
  };

  const goToToday = () => {
    setCurrentDay(today);
  };

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

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-neutral-900 uppercase">Timetable</h1>
            <Clock className="w-6 h-6 text-neutral-900" />
          </div>
          <p className="text-neutral-700 mb-6 text-base sm:text-lg font-mono uppercase tracking-wide">Weekly Schedule</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={() => setView(view === 'today' ? 'week' : 'today')}
            className="flex items-center justify-center gap-2 border-2 border-neutral-900 bg-white text-neutral-900 px-4 py-3 text-sm uppercase tracking-wider font-bold hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all font-mono"
          >
            <Calendar className="w-4 h-4" />
            {view === 'today' ? 'Week View' : 'Day View'}
          </button>
          <button
            onClick={() => createNewEvent()}
            className="flex items-center justify-center gap-2 bg-neutral-900 text-white px-4 py-3 text-sm uppercase tracking-wider font-bold border-2 border-neutral-900 hover:bg-neutral-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>

        {view === 'today' ? (
          // TODAY VIEW
          <>
            <div className="border-2 border-neutral-900 bg-white mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="border-b-2 border-neutral-900 p-4 sm:p-6 bg-neutral-900">
                <div className="flex items-center justify-between">
                  <button
                    onClick={goToPreviousDay}
                    className="p-2 border-2 border-white hover:bg-white hover:text-neutral-900 transition-all text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-serif text-white uppercase">{dayNames[currentDay]}</h2>
                    {currentDay === today && (
                      <p className="text-sm text-neutral-300 font-mono font-bold uppercase tracking-wider">Today</p>
                    )}
                  </div>
                  <button
                    onClick={goToNextDay}
                    className="p-2 border-2 border-white hover:bg-white hover:text-neutral-900 transition-all text-white"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {currentDay !== today && (
                  <div className="mt-4">
                    <button
                      onClick={goToToday}
                      className="w-full border-2 border-white text-white px-4 py-2 text-sm hover:bg-white hover:text-neutral-900 transition-all font-mono font-bold uppercase"
                    >
                      → Go to Today
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-6">
                {todayEvents.length === 0 ? (
                  <div className="text-center py-12 border-4 border-dashed border-neutral-900">
                    <Clock className="w-20 h-20 text-neutral-900 mx-auto mb-4 border-4 border-neutral-900 p-3" />
                    <p className="text-neutral-700 mb-6 font-mono uppercase tracking-wide">No events for {dayNames[currentDay]}</p>
                    <button
                      onClick={() => createNewEvent(currentDay)}
                      className="bg-neutral-900 text-white px-6 py-3 text-sm uppercase tracking-wider font-bold hover:bg-neutral-700 transition-all border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono"
                    >
                      Add Event
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`border-4 p-4 sm:p-6 cursor-pointer hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all border-neutral-900 ${getCategoryStyle(event.category)}`}
                        onClick={() => {
                          setEditingEvent(event);
                          setShowEventModal(true);
                        }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-3">
                          <div className="flex-1">
                            <h3 className="text-xl sm:text-2xl font-serif mb-3 text-neutral-900 font-bold uppercase">{event.title}</h3>
                            <div className="flex items-center gap-2 text-sm mb-2 border-2 border-neutral-900 bg-white px-3 py-2 inline-flex font-mono font-bold">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                            </div>
                            {event.location && (
                              <div className="text-sm mt-3 flex items-center gap-2 font-mono">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs uppercase tracking-wider px-3 py-2 border-2 border-neutral-900 bg-white font-mono font-bold">
                              {event.category}
                            </span>
                          </div>
                        </div>
                        {event.notes && (
                          <div className="text-sm pt-3 border-t-2 border-neutral-900 font-mono text-neutral-700">
                            {event.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          // WEEK VIEW
          <div className="border-2 border-neutral-900 bg-white overflow-x-auto shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="min-w-[1000px]">
              {/* Header */}
              <div className="grid grid-cols-8 border-b-2 border-neutral-900">
                <div className="p-4 bg-neutral-900 border-r-2 border-neutral-900">
                  <span className="text-xs uppercase tracking-wider text-white font-mono font-bold">Time</span>
                </div>
                {dayNames.map((day, idx) => (
                  <div
                    key={idx}
                    className={`p-4 text-center border-r-2 border-neutral-900 ${
                      idx === today ? 'bg-yellow-300' : 'bg-neutral-900'
                    }`}
                  >
                    <div className={`text-xs uppercase tracking-wider font-mono font-bold ${
                      idx === today ? 'text-neutral-900' : 'text-neutral-400'
                    }`}>
                      {day.slice(0, 3)}
                    </div>
                    <div className={`text-sm font-bold mt-1 font-mono ${
                      idx === today ? 'text-neutral-900' : 'text-white'
                    }`}>
                      {day}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time slots */}
              <div className="grid grid-cols-8">
                {/* Time column */}
                <div className="border-r-2 border-neutral-900">
                  {Array.from({ length: 16 }, (_, i) => i + 6).map((hour) => (
                    <div key={hour} className="h-20 border-b-2 border-neutral-900 px-3 py-2 text-right bg-neutral-900">
                      <span className="text-xs text-white font-mono font-bold">
                        {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
                  const dayEvents = getEventsForDay(dayIdx);
                  
                  return (
                    <div key={dayIdx} className="border-r-2 border-neutral-900 relative">
                      {/* Time slot backgrounds */}
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-20 border-b-2 border-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                          onClick={() => {
                            setCurrentDay(dayIdx);
                            setView('today');
                          }}
                        />
                      ))}

                      <div className="absolute inset-0 pointer-events-none">
                        {dayEvents.map((event) => {
                          const startHour = parseInt(event.startTime.split(':')[0]);
                          const startMin = parseInt(event.startTime.split(':')[1]);
                          const endHour = parseInt(event.endTime.split(':')[0]);
                          const endMin = parseInt(event.endTime.split(':')[1]);
                          
                          const startMinutes = (startHour - 6) * 60 + startMin;
                          const endMinutes = (endHour - 6) * 60 + endMin;
                          const duration = endMinutes - startMinutes;
                          
                          const top = (startMinutes / 60) * 80;
                          const height = (duration / 60) * 80;
                          
                          if (startHour < 6 || startHour >= 22) return null;
                          
                          return (
                            <div
                              key={event.id}
                              className={`absolute left-1 right-1 border-2 border-neutral-900 ${height < 60 ? 'p-1' : 'p-2'} pointer-events-auto cursor-pointer hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-xs overflow-hidden ${getCategoryStyle(event.category)}`}
                              style={{
                                top: `${top}px`,
                                height: `${Math.max(height, 50)}px`
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingEvent(event);
                                setShowEventModal(true);
                              }}
                            >
                              <div className="font-bold truncate font-mono uppercase text-neutral-900">{event.title}</div>
                              <div className="mt-1 font-mono font-bold text-neutral-700 text-xs">
                                {formatTime(event.startTime)}
                              </div>
                              {event.location && (
                                <div className="truncate text-xs font-mono text-neutral-600 flex items-center gap-1 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  {event.location}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Categories Legend */}
        <div className="border-2 border-neutral-900 bg-white p-4 sm:p-6 mt-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 mb-4 border-b-2 border-neutral-900 pb-3">
            <Sparkles className="w-5 h-5 text-neutral-900" />
            <h3 className="text-sm uppercase tracking-wider text-neutral-900 font-bold font-mono">Categories</h3>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
            {['class', 'work', 'exercise', 'personal', 'other'].map(cat => (
              <div key={cat} className="flex items-center gap-2 border-2 border-neutral-900 px-3 py-2 bg-white hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                <div className={`w-6 h-6 border-2 border-neutral-900 ${getCategoryStyle(cat)}`}></div>
                <span className="text-sm capitalize font-mono font-bold text-neutral-900 uppercase">{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-neutral-900 max-w-md w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto">
            <div className="border-b-4 border-neutral-900 p-4 sm:p-6 flex items-center justify-between bg-neutral-900 sticky top-0">
              <h2 className="text-xl sm:text-2xl font-serif text-white uppercase">
                {events.find(e => e.id === editingEvent.id) ? 'Edit Event' : 'New Event'}
              </h2>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setEditingEvent(null);
                }}
                className="text-white hover:bg-neutral-700 transition-colors border-2 border-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-neutral-900 text-sm uppercase tracking-wider mb-2 font-bold font-mono">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  placeholder="CHEMISTRY 101, GYM SESSION"
                  className="w-full border-4 border-neutral-900 bg-white px-3 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono font-bold uppercase"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-neutral-900 text-sm uppercase tracking-wider mb-3 font-bold font-mono">
                  Repeat On
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {dayNames.map((name, idx) => {
                    const isSelected = editingEvent.repeatDays && editingEvent.repeatDays.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const currentRepeatDays = editingEvent.repeatDays || [];
                          const newRepeatDays = isSelected
                            ? currentRepeatDays.filter(d => d !== idx)
                            : [...currentRepeatDays, idx].sort((a, b) => a - b);
                          setEditingEvent({ ...editingEvent, repeatDays: newRepeatDays });
                        }}
                        className={`p-3 border-2 text-center transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 border-neutral-900 ${
                          isSelected
                            ? 'bg-neutral-900 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-white text-neutral-900 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-bold font-mono uppercase">{name.slice(0, 3)}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-neutral-600 mt-2 font-mono">
                  {editingEvent.repeatDays && editingEvent.repeatDays.length > 0
                    ? `Repeats on ${editingEvent.repeatDays.length} day${editingEvent.repeatDays.length > 1 ? 's' : ''}`
                    : 'Select days to repeat this event'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-900 text-sm uppercase tracking-wider mb-2 font-bold font-mono">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={editingEvent.startTime}
                    onChange={(e) => setEditingEvent({ ...editingEvent, startTime: e.target.value })}
                    className="w-full border-4 border-neutral-900 bg-white px-3 py-3 text-neutral-900 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-neutral-900 text-sm uppercase tracking-wider mb-2 font-bold font-mono">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={editingEvent.endTime}
                    onChange={(e) => setEditingEvent({ ...editingEvent, endTime: e.target.value })}
                    className="w-full border-4 border-neutral-900 bg-white px-3 py-3 text-neutral-900 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-900 text-sm uppercase tracking-wider mb-3 font-bold font-mono">
                  Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['class', 'work', 'exercise', 'personal', 'other'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setEditingEvent({ ...editingEvent, category: cat })}
                      className={`p-3 border-2 text-left transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 border-neutral-900 ${
                        editingEvent.category === cat
                          ? `${getCategoryStyle(cat)} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`
                          : 'bg-white hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                    >
                      <span className="text-sm font-bold capitalize font-mono uppercase text-neutral-900">{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-neutral-900 text-sm uppercase tracking-wider mb-2 font-bold font-mono">
                  Location
                </label>
                <input
                  type="text"
                  value={editingEvent.location}
                  onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                  placeholder="ROOM 203, MAIN GYM"
                  className="w-full border-4 border-neutral-900 bg-white px-3 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-neutral-900 text-sm uppercase tracking-wider mb-2 font-bold font-mono">
                  Notes
                </label>
                <textarea
                  value={editingEvent.notes}
                  onChange={(e) => setEditingEvent({ ...editingEvent, notes: e.target.value })}
                  placeholder="Materials needed, reminders, etc."
                  rows={3}
                  className="w-full border-4 border-neutral-900 bg-white px-3 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono"
                />
              </div>
            </div>

            <div className="border-t-4 border-neutral-900 p-4 sm:p-6 flex flex-col-reverse sm:flex-row gap-3 sticky bottom-0 bg-white">
              {events.find(e => e.id === editingEvent.id) && (
                <button
                  onClick={() => {
                    deleteEvent(editingEvent.id);
                    setShowEventModal(false);
                    setEditingEvent(null);
                  }}
                  className="border-2 border-neutral-900 bg-white text-neutral-900 px-4 py-3 text-sm uppercase tracking-wider font-bold hover:bg-red-600 hover:text-white hover:border-red-600 transition-all flex items-center justify-center gap-2 w-full sm:w-auto font-mono"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
              <div className="flex-1 flex flex-col-reverse sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setEditingEvent(null);
                  }}
                  className="flex-1 border-2 border-neutral-900 bg-white text-neutral-900 py-3 text-sm uppercase tracking-wider font-bold hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all font-mono"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEvent}
                  disabled={!editingEvent.title.trim()}
                  className="flex-1 bg-neutral-900 text-white py-3 text-sm uppercase tracking-wider font-bold hover:bg-neutral-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:hover:translate-x-0 disabled:hover:translate-y-0 font-mono"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;