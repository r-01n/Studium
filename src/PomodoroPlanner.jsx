import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, RotateCcw, Clock, ArrowRight, ArrowLeft, AlertCircle, X, Sparkles, Home, Volume2, VolumeX
} from 'lucide-react';

const PomodoroPlanner = ({ setCurrentModule }) => {
  const tips = {
    setup: "Pro tip: Most people overestimate what they can do in a day. Start conservative!",
    plan: [
      "Tackle the hardest task first while your brain is fresh!",
      "Break big tasks into smaller chunks—one session, one focused goal.",
      "Don't pack every session full. Leave room to breathe.",
      "Stack similar tasks together to stay in the flow.",
    ]
  };

  const [step, setStep] = useState('setup');
  const [hours, setHours] = useState(4);
  const [split, setSplit] = useState({ work: 25, break: 5, longBreak: 15 });
  const [sessionsUntilLongBreak, setSessionsUntilLongBreak] = useState(4);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerRef = useRef(null);
  const planTipRef = useRef(tips.plan[Math.floor(Math.random() * tips.plan.length)]);
  const audioContextRef = useRef(null);
  const [isCustom, setIsCustom] = useState(false);
  const [customWork, setCustomWork] = useState(25);
  const [customBreak, setCustomBreak] = useState(5);
  const [customLongBreak, setCustomLongBreak] = useState(15);

  // Initialize Audio Context
  useEffect(() => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    } catch (error) {
      console.warn('Audio context not available:', error);
    }
  }, []);

  // Sound functions using Web Audio API
  const playSound = (type) => {
    if (!soundEnabled || !audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (type === 'work-end') {
        oscillator.frequency.setValueAtTime(523.25, ctx.currentTime);
        oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
      } else if (type === 'break-end') {
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        oscillator.frequency.setValueAtTime(554.37, ctx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.4);
      } else if (type === 'complete') {
        const notes = [523.25, 587.33, 659.25, 698.46, 783.99];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);
          osc.start(ctx.currentTime + i * 0.1);
          osc.stop(ctx.currentTime + i * 0.1 + 0.3);
        });
      }
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  };

  // Load preferences on mount
  useEffect(() => {
    const savedPrefs = localStorage.getItem('pomodoroPreferences');

    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.hours) setHours(prefs.hours);
        if (prefs.split) setSplit(prefs.split);
        if (prefs.sessionsUntilLongBreak) setSessionsUntilLongBreak(prefs.sessionsUntilLongBreak);
        if (prefs.soundEnabled !== undefined) setSoundEnabled(prefs.soundEnabled);
        if (prefs.isCustom !== undefined) setIsCustom(prefs.isCustom);
        if (prefs.customWork) setCustomWork(prefs.customWork);
        if (prefs.customBreak) setCustomBreak(prefs.customBreak);
        if (prefs.customLongBreak) setCustomLongBreak(prefs.customLongBreak);
      } catch (e) {
        console.error('Error loading preferences:', e);
      }
    }

    setIsLoaded(true);
  }, []);

  // Save preferences whenever they change
  useEffect(() => {
    if (!isLoaded) return;

    const preferences = {
      hours,
      split,
      sessionsUntilLongBreak,
      soundEnabled,
      isCustom,
      customWork,
      customBreak,
      customLongBreak
    };

    try {
      localStorage.setItem('pomodoroPreferences', JSON.stringify(preferences));
    } catch (e) {
      console.error('Error saving preferences:', e);
    }
  }, [hours, split, sessionsUntilLongBreak, soundEnabled, isLoaded]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);

      if (!isBreak) {
        playSound('work-end');

        const newSessions = [...sessions];
        if (newSessions[currentSession]) newSessions[currentSession].status = 'completed';
        setSessions(newSessions);

        const completions = JSON.parse(localStorage.getItem('pomodoroCompletions') || '[]');
        completions.push({
          timestamp: new Date().toISOString(),
          session: currentSession + 1,
          duration: split.work
        });
        localStorage.setItem('pomodoroCompletions', JSON.stringify(completions));

        if (currentSession < sessions.length - 1) {
          setIsBreak(true);
          const isLongBreak = (currentSession + 1) % sessionsUntilLongBreak === 0;
          setTimeLeft(isLongBreak ? split.longBreak * 60 : split.break * 60);
        } else {
          playSound('complete');
        }
      } else {
        playSound('break-end');
        setIsBreak(false);
        setCurrentSession(c => c + 1);
        if (currentSession + 1 < sessions.length) {
          setTimeLeft(split.work * 60);
        }
      }
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft, isBreak, currentSession, sessions, split, sessionsUntilLongBreak]);

  const generateSessions = () => {
    const totalMinutes = hours * 60;
    const cycleTime = split.work + split.break;
    let numSessions = Math.floor(totalMinutes / cycleTime);
    if (numSessions < 1) numSessions = 1;

    const newSessions = Array.from({ length: numSessions }, (_, i) => ({
      id: i,
      title: `Session ${i + 1}`,
      tasks: [],
      status: 'pending'
    }));

    setSessions(newSessions);
    setCurrentSession(0);
    setStep('plan');
  };

  const startTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(split.work * 60);
      const newSessions = [...sessions];
      if (newSessions[currentSession]) newSessions[currentSession].status = 'active';
      setSessions(newSessions);
    }
    setIsRunning(true);
  };

  const addTask = (sessionId, taskText) => {
    if (!taskText || !taskText.trim()) return;
    const newSessions = [...sessions];
    const session = newSessions.find(s => s.id === sessionId);
    if (!session) return;
    session.tasks.push({ id: Date.now(), text: taskText.trim(), done: false });
    setSessions(newSessions);
  };

  const deleteTask = (sessionId, taskId) => {
    const newSessions = [...sessions];
    const session = newSessions.find(s => s.id === sessionId);
    if (!session) return;
    session.tasks = session.tasks.filter(t => t.id !== taskId);
    setSessions(newSessions);
  };

  const toggleTask = (sessionId, taskId) => {
    const newSessions = [...sessions];
    const session = newSessions.find(s => s.id === sessionId);
    if (!session) return;
    const task = session.tasks.find(t => t.id === taskId);
    if (!task) return;
    task.done = !task.done;
    setSessions(newSessions);
  };

  const handleDragStart = (sessionId, taskId) => {
    setDraggedTask({ sessionId, taskId });
  };

  const handleDrop = (targetSessionId) => {
    if (!draggedTask) return;

    const newSessions = [...sessions];
    const sourceSession = newSessions.find(s => s.id === draggedTask.sessionId);
    const targetSession = newSessions.find(s => s.id === targetSessionId);
    if (!sourceSession || !targetSession) {
      setDraggedTask(null);
      return;
    }

    const taskIndex = sourceSession.tasks.findIndex(t => t.id === draggedTask.taskId);
    if (taskIndex < 0) {
      setDraggedTask(null);
      return;
    }
    const [task] = sourceSession.tasks.splice(taskIndex, 1);
    targetSession.tasks.push(task);

    setSessions(newSessions);
    setDraggedTask(null);
  };

  const moveTask = (sessionId, taskId, direction) => {
    const newSessions = [...sessions];
    const source = newSessions.find(s => s.id === sessionId);
    if (!source) return;
    const taskIndex = source.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    const [task] = source.tasks.splice(taskIndex, 1);
    const targetIndex = sessionId + direction;
    if (targetIndex < 0 || targetIndex >= newSessions.length) {
      source.tasks.splice(taskIndex, 0, task);
      return;
    }
    newSessions[targetIndex].tasks.push(task);
    setSessions(newSessions);
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-neutral-100 p-4 sm:p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setCurrentModule('dashboard')}
            className="flex items-center gap-2 text-neutral-900 hover:bg-neutral-200 mb-6 transition-colors px-3 py-2 border-2 border-neutral-900"
            aria-label="Back to Dashboard"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm uppercase tracking-wider font-mono font-bold">Dashboard</span>
          </button>

          <div className="max-w-xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-neutral-900">POMODORO</h1>
              <Sparkles className="w-6 h-6 text-neutral-900" />
            </div>
            <p className="text-neutral-700 mb-6 text-base sm:text-lg font-mono uppercase tracking-wide">Plan focused work sessions</p>

            <div className="bg-yellow-100 border-2 border-neutral-900 p-4 mb-8 flex items-start gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <AlertCircle className="w-5 h-5 text-neutral-900 flex-shrink-0 mt-0.5" />
              <p className="text-neutral-900 text-sm font-mono">{tips.setup}</p>
            </div>

            <div className="space-y-8">
              <div className="border-2 border-neutral-900 p-6 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <label className="block text-neutral-900 mb-3 text-sm uppercase tracking-wider font-bold font-mono">
                  Hours to work
                </label>
                <input
                  inputMode="numeric"
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full border-b-4 border-neutral-900 bg-transparent px-0 py-2 text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-900 focus:outline-none font-mono"
                  min="1"
                  max="12"
                />
              </div>

              <div className="border-2 border-neutral-900 p-6 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <label className="block text-neutral-900 mb-4 text-sm uppercase tracking-wider font-bold font-mono">
                  Work/Break Split
                </label>
                <div className="space-y-3">
                  {[
                    { work: 25, break: 5, longBreak: 15, label: 'Classic Pomodoro' },
                    { work: 50, break: 10, longBreak: 30, label: 'Extended Focus' },
                    { work: 'custom', break: 'custom', longBreak: 'custom', label: 'Custom' }
                  ].map((s) => (
                    <button
                      key={s.label}
                      onClick={() => {
                        if (s.label === 'Custom') {
                          setIsCustom(true);
                          setSplit({ work: customWork, break: customBreak, longBreak: customLongBreak });
                        } else {
                          setIsCustom(false);
                          setSplit(s);
                        }
                      }}
                      className={`w-full text-left px-4 py-4 border-2 border-neutral-900 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 ${
                        (s.label === 'Custom' ? isCustom : split.work === s.work && split.break === s.break && !isCustom)                          ? 'bg-neutral-900 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold font-mono uppercase tracking-wide">{s.label}</span>
                        <span className="text-sm font-mono">{s.work}/{s.break}/{s.longBreak}min</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {isCustom && (
                <div className="mt-4 space-y-3 p-4 border-2 border-neutral-900 bg-neutral-50">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold font-mono text-neutral-700 mb-1">
                      Work minutes
                    </label>
                    <input
                      type="number"
                      value={customWork}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        setCustomWork(val);
                        setSplit({ work: val, break: customBreak, longBreak: customLongBreak });
                      }}
                      className="w-full border-2 border-neutral-900 px-3 py-2 text-lg font-bold font-mono focus:outline-none"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold font-mono text-neutral-700 mb-1">
                      Short break minutes
                    </label>
                    <input
                      type="number"
                      value={customBreak}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        setCustomBreak(val);
                        setSplit({ work: customWork, break: val, longBreak: customLongBreak });
                      }}
                      className="w-full border-2 border-neutral-900 px-3 py-2 text-lg font-bold font-mono focus:outline-none"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold font-mono text-neutral-700 mb-1">
                      Long break minutes
                    </label>
                    <input
                      type="number"
                      value={customLongBreak}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        setCustomLongBreak(val);
                        setSplit({ work: customWork, break: customBreak, longBreak: val });
                      }}
                      className="w-full border-2 border-neutral-900 px-3 py-2 text-lg font-bold font-mono focus:outline-none"
                      min="1"
                    />
                  </div>
                </div>
              )}

              <div className="border-2 border-neutral-900 p-6 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <label className="block text-neutral-900 mb-3 text-sm uppercase tracking-wider font-bold font-mono">
                  Sessions until long break
                </label>
                <input
                  inputMode="numeric"
                  type="number"
                  value={sessionsUntilLongBreak}
                  onChange={(e) => setSessionsUntilLongBreak(Math.max(2, parseInt(e.target.value) || 4))}
                  className="w-full border-b-4 border-neutral-900 bg-transparent px-0 py-2 text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 focus:outline-none font-mono"
                  min="2"
                  max="8"
                />
                <p className="text-neutral-600 text-sm mt-3 font-mono">
                  {split.longBreak}min break after every {sessionsUntilLongBreak} sessions
                </p>
              </div>

              <div className="border-2 border-neutral-900 p-6 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <label className="block text-neutral-900 mb-3 text-sm uppercase tracking-wider font-bold font-mono">
                  Sound Notifications
                </label>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-full flex items-center justify-between px-4 py-4 border-2 border-neutral-900 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 ${
                    soundEnabled
                      ? 'bg-neutral-900 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  <span className="font-bold font-mono uppercase tracking-wide">
                    {soundEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
                <p className="text-neutral-600 text-sm mt-3 font-mono">
                  Notification sounds when sessions end
                </p>
              </div>

              <button
                onClick={generateSessions}
                className="w-full bg-neutral-900 text-white py-4 sm:py-5 text-sm uppercase tracking-wider font-bold border-2 border-neutral-900 hover:bg-neutral-700 transition-all flex items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono"
              >
                Generate Sessions
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'plan') {
    return (
      <div className="min-h-screen bg-neutral-100 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setCurrentModule('dashboard')}
            className="flex items-center gap-2 text-neutral-900 hover:bg-neutral-200 mb-6 transition-colors px-3 py-2 border-2 border-neutral-900"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm uppercase tracking-wider font-mono font-bold">Dashboard</span>
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 border-b-4 border-neutral-900 pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-neutral-900 mb-1">SESSION PLANNING</h1>
              <p className="text-neutral-700 text-sm font-mono font-bold uppercase">{sessions.length} sessions · {hours}h total</p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => setStep('setup')}
                className="border-2 border-neutral-900 bg-white text-neutral-900 px-4 py-2 text-sm uppercase tracking-wider font-bold hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all font-mono"
              >
                ← Setup
              </button>
              <button
                onClick={() => setStep('work')}
                className="bg-neutral-900 text-white px-4 py-2 text-sm uppercase tracking-wider font-bold border-2 border-neutral-900 hover:bg-neutral-700 transition-all flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono"
              >
                Begin
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-yellow-100 border-2 border-neutral-900 p-4 mb-6 flex items-start gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <AlertCircle className="w-5 h-5 text-neutral-900 flex-shrink-0 mt-0.5" />
            <p className="text-neutral-900 text-sm font-mono">{planTipRef.current}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sessions.map((session, idx) => (
              <div
                key={session.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(session.id)}
                className="border-2 border-neutral-900 bg-white hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all overflow-hidden"
              >
                <div className="border-b-2 border-neutral-900 px-3 sm:px-4 py-3 bg-neutral-900">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wide">Session {session.id + 1}</h3>
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="p-3 sm:p-4">
                  <div className="space-y-2 mb-3 min-h-[100px] sm:min-h-[120px]">
                    {session.tasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(session.id, task.id)}
                        className="border-2 border-neutral-900 p-2 sm:p-3 cursor-move hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all group bg-white flex items-center justify-between gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-neutral-900 truncate font-mono">
                            {task.text}
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => moveTask(session.id, task.id, -1)}
                              className="inline-flex items-center justify-center p-1 border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
                              aria-label="Move to previous session"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => moveTask(session.id, task.id, 1)}
                              className="inline-flex items-center justify-center p-1 border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
                              aria-label="Move to next session"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteTask(session.id, task.id)}
                          className="text-neutral-900 hover:bg-red-500 hover:text-white border-2 border-neutral-900 p-1 transition-colors"
                          aria-label="Delete task"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Add task..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addTask(session.id, e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="w-full border-b-2 border-neutral-900 bg-transparent px-0 py-2 text-sm text-neutral-900 placeholder-neutral-500 focus:outline-none focus:border-b-4 transition-all font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentSessionData = sessions[currentSession];
  const progress = sessions.length > 0 ? ((currentSession + 1) / sessions.length) * 100 : 0;
  const isLongBreak = isBreak && (currentSession + 1) % sessionsUntilLongBreak === 0;
  const allSessionsComplete = sessions.length === 0 || currentSession >= sessions.length;

  return (
    <div className="min-h-screen bg-neutral-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => setCurrentModule('dashboard')}
          className="flex items-center gap-2 text-neutral-900 hover:bg-neutral-200 mb-6 transition-colors px-3 py-2 border-2 border-neutral-900"
        >
          <Home className="w-4 h-4" />
          <span className="text-sm uppercase tracking-wider font-mono font-bold">Dashboard</span>
        </button>

        <div className="max-w-2xl mx-auto">
          {allSessionsComplete ? (
            <div className="border-2 border-neutral-900 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 sm:p-12 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-neutral-900 mb-3 uppercase">All Done!</h2>
              <p className="text-neutral-700 mb-6 text-base font-mono">
                Completed {sessions.length} sessions
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    setStep('setup');
                    setCurrentSession(0);
                    setIsBreak(false);
                    setTimeLeft(0);
                    setIsRunning(false);
                  }}
                  className="bg-neutral-900 text-white px-6 py-3 text-sm uppercase tracking-wider font-bold border-2 border-neutral-900 hover:bg-neutral-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono"
                >
                  Start New
                </button>
                <button
                  onClick={() => setCurrentModule('dashboard')}
                  className="border-2 border-neutral-900 bg-white text-neutral-900 px-6 py-3 text-sm uppercase tracking-wider font-bold hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all font-mono"
                >
                  Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-neutral-900 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <div className="border-b-2 border-neutral-900 px-4 py-4 bg-neutral-900">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif text-white mb-1 uppercase">
                      {isBreak ? (isLongBreak ? '🎉 Long Break' : '☕ Break') : `Session ${currentSession + 1}`}
                    </h2>
                    <p className="text-neutral-300 text-sm font-mono">
                      {isBreak && isLongBreak && `${split.longBreak} minutes · `}{currentSession + 1} of {sessions.length}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="text-white hover:bg-neutral-700 transition-colors p-2 border-2 border-white"
                      title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
                    >
                      {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => setStep('setup')}
                      className="text-white hover:bg-neutral-700 text-sm uppercase tracking-wider transition-colors px-2 py-1 border-2 border-white font-mono font-bold"
                    >
                      Setup
                    </button>
                    <button
                      onClick={() => setStep('plan')}
                      className="text-white hover:bg-neutral-700 text-sm uppercase tracking-wider transition-colors px-2 py-1 border-2 border-white font-mono font-bold"
                    >
                      Plan
                    </button>
                  </div>
                </div>

                <div className="bg-neutral-700 h-2 overflow-hidden border-2 border-white">
                  <div
                    className="bg-white h-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  />
                </div>
              </div>

              <div className="p-6 sm:p-8 text-center">
                {isBreak && (
                  <div className="bg-yellow-100 border-2 border-neutral-900 p-4 mb-4 flex items-start gap-3 text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <AlertCircle className="w-5 h-5 text-neutral-900 flex-shrink-0 mt-0.5" />
                    <p className="text-neutral-900 text-sm font-mono">
                      {isLongBreak
                        ? "Nice work! Take a real break—step away from the screen, stretch, hydrate."
                        : "Quick break! Stand up, look away from the screen, take a breath."}
                    </p>
                  </div>
                )}

                <div className="text-6xl sm:text-8xl md:text-9xl font-bold text-neutral-900 mb-6 font-mono tracking-tighter transition-all duration-300">
                  {formatTime(timeLeft)}
                </div>

                <div className="flex justify-center gap-4 mb-6">
                  <button
                    onClick={() => isRunning ? setIsRunning(false) : startTimer()}
                    className="border-2 border-neutral-900 bg-white text-neutral-900 p-4 sm:p-5 hover:bg-neutral-900 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5"
                    aria-label={isRunning ? 'Pause timer' : 'Start timer'}
                  >
                    {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </button>
                  <button
                    onClick={() => {
                      setIsRunning(false);
                      setTimeLeft(isBreak ? (isLongBreak ? split.longBreak * 60 : split.break * 60) : split.work * 60);
                    }}
                    className="border-2 border-neutral-900 bg-white text-neutral-900 p-4 sm:p-5 hover:bg-neutral-900 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5"
                    aria-label="Reset timer"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {!isBreak && currentSessionData && (
                <div className="border-t-2 border-neutral-900 px-4 py-4 sm:px-8 sm:py-6 bg-neutral-50">
                  <h3 className="text-sm uppercase tracking-wider text-neutral-900 mb-3 font-bold font-mono">Tasks</h3>
                  <div className="space-y-2">
                    {currentSessionData.tasks.length === 0 ? (
                      <p className="text-neutral-500 text-center py-4 text-sm font-mono">No tasks for this session</p>
                    ) : (
                      currentSessionData.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="border-2 border-neutral-900 p-3 flex items-start gap-3 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all group bg-white"
                        >
                          <button
                            onClick={() => toggleTask(currentSession, task.id)}
                            className="flex-shrink-0 mt-0.5"
                            aria-label="Toggle task completion"
                          >
                            <div className={`w-6 h-6 border-2 transition-all flex items-center justify-center ${
                              task.done
                                ? 'border-neutral-900 bg-neutral-900'
                                : 'border-neutral-900'
                            }`}>
                              {task.done && (
                                <svg className="w-full h-full text-white" viewBox="0 0 16 16" fill="none">
                                  <path d="M3 8L6 11L13 4" stroke="currentColor" strokeWidth="3" />
                                </svg>
                              )}
                            </div>
                          </button>
                          <span className={`text-neutral-900 flex-1 font-mono ${task.done ? 'line-through text-neutral-400' : ''}`}>
                            {task.text}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => moveTask(currentSession, task.id, -1)}
                              className="p-1 border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
                              aria-label="Move to previous session"
                            >
                              <ArrowLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveTask(currentSession, task.id, 1)}
                              className="p-1 border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
                              aria-label="Move to next session"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => deleteTask(currentSession, task.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-white bg-red-600 hover:bg-red-700 border-2 border-neutral-900 p-1"
                              aria-label="Delete task"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PomodoroPlanner;