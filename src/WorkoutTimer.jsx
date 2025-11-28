import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Home, Dumbbell, Plus, Trash2, AlertCircle, ArrowRight, ChevronRight, Calendar, TrendingUp, Edit2, Save, X } from 'lucide-react';

const WorkoutTimer = ({ setCurrentModule }) => {
  const [view, setView] = useState('workouts');
  const [workouts, setWorkouts] = useState(null);
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [workoutHistory, setWorkoutHistory] = useState(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [savedSession, setSavedSession] = useState(null);

  useEffect(() => {
    const savedWorkouts = localStorage.getItem('workouts');
    const savedHistory = localStorage.getItem('workoutHistory');
    const savedActiveSession = localStorage.getItem('activeWorkoutSession');
    
    const loadedWorkouts = savedWorkouts ? JSON.parse(savedWorkouts) : [];
    const loadedHistory = savedHistory ? JSON.parse(savedHistory) : [];
    
    setWorkouts(loadedWorkouts);
    setWorkoutHistory(loadedHistory);
    
    if (savedActiveSession) {
      try {
        const session = JSON.parse(savedActiveSession);
        setSavedSession(session);
        setShowResumePrompt(true);
      } catch (e) {
        localStorage.removeItem('activeWorkoutSession');
      }
    }
  }, []);

  useEffect(() => {
    if (workouts === null) return;
    try {
      localStorage.setItem('workouts', JSON.stringify(workouts));
    } catch (e) {
      console.error('Error saving workouts:', e);
    }
  }, [workouts]);

  useEffect(() => {
    if (workoutHistory === null) return;
    try {
      localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
    } catch (e) {
      console.error('Error saving history:', e);
    }
  }, [workoutHistory]);

  useEffect(() => {
    if (sessionData && view === 'session') {
      try {
        const sessionToSave = {
          ...sessionData,
          currentWorkout: currentWorkout,
          savedAt: Date.now()
        };
        localStorage.setItem('activeWorkoutSession', JSON.stringify(sessionToSave));
      } catch (e) {
        console.error('Error saving session:', e);
      }
    } else {
      localStorage.removeItem('activeWorkoutSession');
    }
  }, [sessionData, view, currentWorkout]);

  if (workouts === null || workoutHistory === null) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4">
        <div className="text-center border-2 border-neutral-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-4xl mb-4">💪</div>
          <div className="text-neutral-900 font-mono font-bold uppercase">Loading workouts...</div>
        </div>
      </div>
    );
  }

  if (showResumePrompt && savedSession) {
    const minutesAgo = Math.floor((Date.now() - savedSession.savedAt) / 1000 / 60);
    
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-md w-full bg-white border-2 border-neutral-900 p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-center mb-6">
            <div className="text-4xl sm:text-5xl mb-4">🔄</div>
            <h2 className="text-2xl sm:text-3xl font-serif text-neutral-900 mb-2 uppercase">Resume?</h2>
            <p className="text-sm sm:text-base text-neutral-700 font-mono">
              Unfinished workout from {minutesAgo}min ago
            </p>
          </div>

          <div className="bg-yellow-100 border-2 border-neutral-900 p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-sm text-neutral-900 mb-2 font-bold font-mono">
              {savedSession.workoutName}
            </div>
            <div className="text-sm text-neutral-700 font-mono">
              Exercise {savedSession.currentExerciseIndex + 1} · Set {savedSession.currentSet + 1}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setCurrentWorkout(savedSession.currentWorkout);
                setSessionData(savedSession);
                setView('session');
                setShowResumePrompt(false);
              }}
              className="w-full bg-neutral-900 text-white py-3 sm:py-4 text-xs sm:text-sm uppercase tracking-wider font-bold hover:bg-neutral-700 transition-all border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono"
            >
              Resume Workout
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('activeWorkoutSession');
                setShowResumePrompt(false);
                setSavedSession(null);
              }}
              className="w-full border-2 border-neutral-900 bg-white text-neutral-900 py-3 sm:py-4 text-xs sm:text-sm uppercase tracking-wider font-bold hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all font-mono"
            >
              Start Fresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  const createNewWorkout = () => {
    const newWorkout = {
      id: Date.now(),
      name: 'New Workout',
      exercises: []
    };
    setEditingWorkout(newWorkout);
    setView('builder');
  };

  const saveWorkout = () => {
    if (editingWorkout.id && workouts.find(w => w.id === editingWorkout.id)) {
      setWorkouts(workouts.map(w => w.id === editingWorkout.id ? editingWorkout : w));
    } else {
      setWorkouts([...workouts, editingWorkout]);
    }
    setView('workouts');
    setEditingWorkout(null);
  };

  const startWorkout = (workout) => {
    setCurrentWorkout(workout);
    setSessionData({
      workoutId: workout.id,
      workoutName: workout.name,
      startTime: Date.now(),
      currentExerciseIndex: 0,
      currentSet: 0,
      exerciseData: workout.exercises.map(ex => ({
        exerciseId: ex.id,
        sets: []
      }))
    });
    setView('session');
  };

  const completeSession = () => {
    const session = {
      ...sessionData,
      endTime: Date.now(),
      duration: Math.floor((Date.now() - sessionData.startTime) / 1000)
    };
    setWorkoutHistory([session, ...workoutHistory]);
    localStorage.removeItem('activeWorkoutSession');
    setView('complete');
  };

  if (view === 'workouts') {
    return <WorkoutList 
      workouts={workouts}
      setCurrentModule={setCurrentModule}
      createNewWorkout={createNewWorkout}
      startWorkout={startWorkout}
      editWorkout={(w) => {
        setEditingWorkout(w);
        setView('builder');
      }}
      deleteWorkout={(id) => setWorkouts(workouts.filter(w => w.id !== id))}
      viewHistory={() => setView('history')}
    />;
  }

  if (view === 'builder') {
    return <WorkoutBuilder
      workout={editingWorkout}
      setWorkout={setEditingWorkout}
      saveWorkout={saveWorkout}
      cancel={() => {
        setEditingWorkout(null);
        setView('workouts');
      }}
      setCurrentModule={setCurrentModule}
    />;
  }

  if (view === 'session') {
    return <WorkoutSession
      workout={currentWorkout}
      sessionData={sessionData}
      setSessionData={setSessionData}
      completeSession={completeSession}
      cancel={() => {
        setView('workouts');
        setSessionData(null);
      }}
      setCurrentModule={setCurrentModule}
    />;
  }

  if (view === 'complete') {
    return <SessionComplete
      sessionData={sessionData}
      workout={currentWorkout}
      backToWorkouts={() => {
        setView('workouts');
        setSessionData(null);
        setCurrentWorkout(null);
      }}
      setCurrentModule={setCurrentModule}
    />;
  }

  if (view === 'history') {
    return <WorkoutHistory
      history={workoutHistory}
      workouts={workouts}
      back={() => setView('workouts')}
      setCurrentModule={setCurrentModule}
    />;
  }
};

const WorkoutList = ({ workouts, setCurrentModule, createNewWorkout, startWorkout, editWorkout, deleteWorkout, viewHistory }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  return (
    <div className="min-h-screen bg-neutral-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => setCurrentModule('dashboard')}
          className="flex items-center gap-2 text-neutral-900 hover:bg-neutral-200 mb-6 sm:mb-8 transition-colors px-3 py-2 border-2 border-neutral-900"
        >
          <Home className="w-4 h-4" />
          <span className="text-xs sm:text-sm uppercase tracking-wider font-mono font-bold">Dashboard</span>
        </button>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-neutral-900 mb-2 uppercase">My Workouts</h1>
          <p className="text-sm sm:text-base lg:text-lg text-neutral-700 mb-4 sm:mb-0 font-mono">Track PRs, volume, progress</p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={viewHistory}
              className="flex items-center justify-center gap-2 border-2 border-neutral-900 bg-white text-neutral-900 px-4 py-3 text-xs sm:text-sm uppercase tracking-wider font-bold hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all font-mono"
            >
              <Calendar className="w-4 h-4" />
              History
            </button>
            <button
              onClick={createNewWorkout}
              className="flex items-center justify-center gap-2 bg-neutral-900 text-white px-6 py-3 text-xs sm:text-sm uppercase tracking-wider font-bold border-2 border-neutral-900 hover:bg-neutral-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono"
            >
              <Plus className="w-4 h-4" />
              New Workout
            </button>
          </div>
        </div>

        {workouts.length === 0 ? (
          <div className="bg-white border-2 border-neutral-900 p-8 sm:p-12 lg:p-16 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <Dumbbell className="w-12 h-12 sm:w-16 sm:h-16 text-neutral-900 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-serif text-neutral-900 mb-2 uppercase">No Workouts Yet</h3>
            <p className="text-sm sm:text-base text-neutral-700 mb-6 font-mono">Create your first workout</p>
            <button
              onClick={createNewWorkout}
              className="bg-neutral-900 text-white px-6 py-3 text-xs sm:text-sm uppercase tracking-wider font-bold border-2 border-neutral-900 hover:bg-neutral-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono"
            >
              Create Workout
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {workouts.map((workout) => (
              <div key={workout.id} className="bg-white border-2 border-neutral-900 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all group">
                <div className="p-4 sm:p-6">
                  <h3 className="text-xl sm:text-2xl font-serif text-neutral-900 mb-3 uppercase">{workout.name}</h3>
                  <p className="text-neutral-700 text-sm mb-4 font-mono font-bold">
                    {workout.exercises.length} EXERCISE{workout.exercises.length !== 1 ? 'S' : ''}
                  </p>
                  <div className="space-y-1 mb-6">
                    {workout.exercises.slice(0, 3).map((ex) => (
                      <div key={ex.id} className="text-sm text-neutral-600 flex items-center gap-2 font-mono">
                        <div className="w-2 h-2 bg-neutral-900 border border-neutral-900 flex-shrink-0" />
                        <span className="truncate">{ex.name || 'Unnamed exercise'}</span>
                      </div>
                    ))}
                    {workout.exercises.length > 3 && (
                      <div className="text-sm text-neutral-500 font-mono font-bold">
                        +{workout.exercises.length - 3} MORE
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-t-2 border-neutral-900 p-3 sm:p-4 flex gap-2 bg-neutral-50">
                  <button
                    onClick={() => startWorkout(workout)}
                    className="flex-1 bg-neutral-900 text-white py-2 text-xs sm:text-sm uppercase tracking-wider font-bold hover:bg-neutral-700 transition-all border-2 border-neutral-900 font-mono"
                  >
                    Start
                  </button>
                  <button
                    onClick={() => editWorkout(workout)}
                    className="border-2 border-neutral-900 bg-white text-neutral-900 px-3 sm:px-4 py-2 hover:bg-neutral-900 hover:text-white transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteConfirm(workout.id);
                    }}
                    className="border-2 border-neutral-900 bg-white text-neutral-900 px-3 sm:px-4 py-2 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 sm:p-8 z-50">
            <div className="bg-white border-2 border-neutral-900 p-6 sm:p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-xl sm:text-2xl font-serif text-neutral-900 mb-4 uppercase">Delete Workout?</h3>
              <p className="text-sm sm:text-base text-neutral-700 mb-6 font-mono">
                This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 border-2 border-neutral-900 bg-white text-neutral-900 py-3 text-xs sm:text-sm uppercase tracking-wider font-bold hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all font-mono"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteWorkout(deleteConfirm);
                    setDeleteConfirm(null);
                  }}
                  className="flex-1 bg-red-600 text-white py-3 text-xs sm:text-sm uppercase tracking-wider font-bold border-2 border-neutral-900 hover:bg-red-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const WorkoutBuilder = ({ workout, setWorkout, saveWorkout, cancel, setCurrentModule }) => {
  const addExercise = () => {
    setWorkout({
      ...workout,
      exercises: [...workout.exercises, {
        id: Date.now(),
        name: '',
        sets: 3,
        repsOrTime: 'reps',
        targetReps: '8-12',
        timePerSet: 30,
        restTime: 90,
        notes: '',
        isBodyweight: false
      }]
    });
  };

  const updateExercise = (id, field, value) => {
    setWorkout({
      ...workout,
      exercises: workout.exercises.map(ex =>
        ex.id === id ? { ...ex, [field]: value } : ex
      )
    });
  };

  const deleteExercise = (id) => {
    setWorkout({
      ...workout,
      exercises: workout.exercises.filter(ex => ex.id !== id)
    });
  };

  return (
    <div className="min-h-screen bg-neutral-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => setCurrentModule('dashboard')}
          className="flex items-center gap-2 text-neutral-900 hover:bg-neutral-200 mb-6 sm:mb-8 transition-colors px-3 py-2 border-2 border-neutral-900"
        >
          <Home className="w-4 h-4" />
          <span className="text-xs sm:text-sm uppercase tracking-wider font-mono font-bold">Dashboard</span>
        </button>

        <div className="mb-6 sm:mb-8">
          <input
            type="text"
            value={workout.name}
            onChange={(e) => setWorkout({ ...workout, name: e.target.value })}
            className="text-3xl sm:text-4xl lg:text-5xl font-serif text-neutral-900 bg-transparent border-b-4 border-neutral-900 focus:outline-none mb-4 w-full uppercase font-bold"
            placeholder="WORKOUT NAME"
          />
          <p className="text-sm sm:text-base text-neutral-700 font-mono uppercase tracking-wide">Build your routine</p>
        </div>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl sm:text-2xl font-serif text-neutral-900 uppercase">Exercises</h2>
            <button
              onClick={addExercise}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-neutral-900 text-white px-4 py-3 text-xs sm:text-sm uppercase tracking-wider font-bold border-2 border-neutral-900 hover:bg-neutral-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono"
            >
              <Plus className="w-4 h-4" />
              Add Exercise
            </button>
          </div>

          {workout.exercises.length === 0 ? (
            <div className="bg-white border-2 border-neutral-900 p-8 sm:p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <Dumbbell className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-900 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-neutral-700 font-mono uppercase">Add exercises to workout</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {workout.exercises.map((ex, idx) => (
                <div key={ex.id} className="bg-white border-2 border-neutral-900 p-4 sm:p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="bg-neutral-900 text-white px-3 py-2 text-sm font-mono font-bold min-w-[40px] text-center flex-shrink-0 border-2 border-neutral-900">
                      {idx + 1}
                    </div>
                    <div className="flex-1 space-y-4 min-w-0">
                      <input
                        type="text"
                        placeholder="EXERCISE NAME"
                        value={ex.name}
                        onChange={(e) => updateExercise(ex.id, 'name', e.target.value)}
                        className="w-full border-b-4 border-neutral-900 bg-transparent px-0 py-2 text-lg sm:text-xl font-bold text-neutral-900 placeholder-neutral-500 focus:outline-none font-mono uppercase"
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border-2 border-neutral-900 p-3 bg-neutral-50">
                          <label className="block text-neutral-900 text-xs uppercase tracking-wider mb-2 font-bold font-mono">Sets</label>
                          <input
                            type="number"
                            value={ex.sets}
                            onChange={(e) => updateExercise(ex.id, 'sets', Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full border-b-2 border-neutral-900 bg-transparent px-0 py-1 text-2xl font-bold text-neutral-900 focus:outline-none font-mono"
                            min="1"
                          />
                        </div>
                        <div className="border-2 border-neutral-900 p-3 bg-neutral-50">
                          <label className="block text-neutral-900 text-xs uppercase tracking-wider mb-2 font-bold font-mono">Type</label>
                          <select
                            value={ex.repsOrTime}
                            onChange={(e) => updateExercise(ex.id, 'repsOrTime', e.target.value)}
                            className="w-full border-b-2 border-neutral-900 bg-transparent px-0 py-1 text-sm font-bold text-neutral-900 focus:outline-none font-mono uppercase"
                          >
                            <option value="reps">REPS</option>
                            <option value="time">TIMED</option>
                          </select>
                        </div>
                      </div>

                      {ex.repsOrTime === 'reps' ? (
                        <div className="border-2 border-neutral-900 p-3 bg-neutral-50">
                          <label className="block text-neutral-900 text-xs uppercase tracking-wider mb-2 font-bold font-mono">Target Reps</label>
                          <input
                            type="text"
                            placeholder="8-12 or 10"
                            value={ex.targetReps}
                            onChange={(e) => updateExercise(ex.id, 'targetReps', e.target.value)}
                            className="w-full border-b-2 border-neutral-900 bg-transparent px-0 py-1 text-lg font-bold text-neutral-900 placeholder-neutral-500 focus:outline-none font-mono"
                          />
                        </div>
                      ) : (
                        <div className="border-2 border-neutral-900 p-3 bg-neutral-50">
                          <label className="block text-neutral-900 text-xs uppercase tracking-wider mb-2 font-bold font-mono">Time/Set (sec)</label>
                          <input
                            type="number"
                            value={ex.timePerSet}
                            onChange={(e) => updateExercise(ex.id, 'timePerSet', Math.max(5, parseInt(e.target.value) || 30))}
                            className="w-full border-b-2 border-neutral-900 bg-transparent px-0 py-1 text-lg font-bold text-neutral-900 focus:outline-none font-mono"
                            min="5"
                          />
                        </div>
                      )}

                      <div className="border-2 border-neutral-900 p-3 bg-neutral-50">
                        <label className="block text-neutral-900 text-xs uppercase tracking-wider mb-2 font-bold font-mono">Rest Time (sec)</label>
                        <input
                          type="number"
                          value={ex.restTime}
                          onChange={(e) => updateExercise(ex.id, 'restTime', Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full border-b-2 border-neutral-900 bg-transparent px-0 py-1 text-lg font-bold text-neutral-900 focus:outline-none font-mono"
                          min="0"
                        />
                      </div>

                      <div className="border-2 border-neutral-900 p-3 bg-neutral-50">
                        <label className="block text-neutral-900 text-xs uppercase tracking-wider mb-2 font-bold font-mono">Notes</label>
                        <input
                          type="text"
                          placeholder="135lbs, focus on depth"
                          value={ex.notes}
                          onChange={(e) => updateExercise(ex.id, 'notes', e.target.value)}
                          className="w-full border-b-2 border-neutral-900 bg-transparent px-0 py-1 text-sm text-neutral-900 placeholder-neutral-500 focus:outline-none font-mono"
                        />
                      </div>
                      
                      <div className="border-2 border-neutral-900 p-3 bg-neutral-50">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ex.isBodyweight || false}
                            onChange={(e) => updateExercise(ex.id, 'isBodyweight', e.target.checked)}
                            className="w-5 h-5 border-2 border-neutral-900"
                          />
                          <span className="text-xs sm:text-sm text-neutral-900 font-mono font-bold uppercase">Bodyweight</span>
                        </label>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteExercise(ex.id)}
                      className="text-white bg-red-600 hover:bg-red-700 transition-colors p-2 flex-shrink-0 border-2 border-neutral-900"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={cancel}
            className="flex-1 border-2 border-neutral-900 bg-white text-neutral-900 py-3 sm:py-4 text-xs sm:text-sm uppercase tracking-wider font-bold hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all font-mono"
          >
            Cancel
          </button>
          <button
            onClick={saveWorkout}
            className="flex-1 bg-neutral-900 text-white py-3 sm:py-4 text-xs sm:text-sm uppercase tracking-wider font-bold border-2 border-neutral-900 hover:bg-neutral-700 transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono"
          >
            <Save className="w-4 h-4" />
            Save Workout
          </button>
        </div>
      </div>
    </div>
  );
};

const WorkoutSession = ({ workout, sessionData, setSessionData, completeSession, cancel, setCurrentModule }) => {
  const [phase, setPhase] = useState('exercise');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  const currentExercise = workout.exercises[sessionData.currentExerciseIndex];
  const currentExerciseData = sessionData.exerciseData[sessionData.currentExerciseIndex];

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (phase === 'exercise' && currentExercise.repsOrTime === 'time') {
        handleSetComplete();
      }
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSetComplete = (reps = null, weight = null) => {
    const setData = {
      setNumber: sessionData.currentSet + 1,
      reps: reps || (currentExercise.repsOrTime === 'time' ? null : 0),
      weight: weight || 0,
      timestamp: Date.now()
    };

    const newExerciseData = [...sessionData.exerciseData];
    newExerciseData[sessionData.currentExerciseIndex].sets.push(setData);

    if (sessionData.currentSet + 1 < currentExercise.sets) {
      setSessionData({
        ...sessionData,
        currentSet: sessionData.currentSet + 1,
        exerciseData: newExerciseData
      });
      
      if (currentExercise.restTime > 0) {
        setPhase('rest');
        setTimeLeft(currentExercise.restTime);
        setIsRunning(true);
      }
    } else if (sessionData.currentExerciseIndex + 1 < workout.exercises.length) {
      setSessionData({
        ...sessionData,
        currentExerciseIndex: sessionData.currentExerciseIndex + 1,
        currentSet: 0,
        exerciseData: newExerciseData
      });
      
      const nextExercise = workout.exercises[sessionData.currentExerciseIndex + 1];
      if (currentExercise.restTime > 0) {
        setPhase('rest');
        setTimeLeft(currentExercise.restTime);
        setIsRunning(true);
      } else {
        setPhase('exercise');
        setTimeLeft(nextExercise.repsOrTime === 'time' ? nextExercise.timePerSet : 0);
        setIsRunning(false);
      }
    } else {
      setSessionData({
        ...sessionData,
        exerciseData: newExerciseData
      });
      completeSession();
    }
  };

  const skipRest = () => {
    setIsRunning(false);
    setPhase('exercise');
    const nextExercise = workout.exercises[sessionData.currentExerciseIndex];
    setTimeLeft(nextExercise.repsOrTime === 'time' ? nextExercise.timePerSet : 0);
  };

  const startTimer = () => {
    if (timeLeft === 0 && currentExercise.repsOrTime === 'time') {
      setTimeLeft(currentExercise.timePerSet);
    }
    setIsRunning(true);
  };

  const progress = ((sessionData.currentExerciseIndex * 100 + ((sessionData.currentSet + 1) / currentExercise.sets) * 100) / workout.exercises.length);

  if (phase === 'rest') {
    return (
      <div className="min-h-screen bg-neutral-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border-2 border-neutral-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="border-b-2 border-neutral-900 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-neutral-900">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-serif text-white uppercase">☕ Rest</h2>
                <button
                  onClick={cancel}
                  className="text-white border-2 border-white px-3 py-1 hover:bg-white hover:text-neutral-900 text-xs sm:text-sm uppercase tracking-wider transition-colors font-mono font-bold"
                >
                  End
                </button>
              </div>
              <div className="bg-neutral-700 h-2 overflow-hidden border-2 border-white">
                <div className="bg-white h-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-12 text-center">
              <div className="text-7xl sm:text-8xl lg:text-9xl font-bold text-neutral-900 mb-6 sm:mb-8 font-mono">
                {formatTime(timeLeft)}
              </div>
              <p className="text-sm sm:text-base text-neutral-700 mb-6 sm:mb-8 font-mono uppercase">
                Next: {workout.exercises[sessionData.currentExerciseIndex].name} · Set {sessionData.currentSet + 1}
              </p>
              <button
                onClick={skipRest}
                className="bg-neutral-900 text-white px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm uppercase tracking-wider font-bold border-2 border-neutral-900 hover:bg-neutral-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono"
              >
                Skip Rest
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border-2 border-neutral-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-2 border-neutral-900 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-neutral-900">
            <div className="flex items-center justify-between mb-4">
              <div className="min-w-0 flex-1 pr-4">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif text-white mb-1 truncate uppercase">{currentExercise.name}</h2>
                <p className="text-sm sm:text-base text-neutral-300 font-mono font-bold">SET {sessionData.currentSet + 1} OF {currentExercise.sets}</p>
              </div>
              <button
                onClick={cancel}
                className="text-white border-2 border-white px-3 py-1 hover:bg-white hover:text-neutral-900 text-xs sm:text-sm uppercase tracking-wider transition-colors flex-shrink-0 font-mono font-bold"
              >
                End
              </button>
            </div>
            <div className="bg-neutral-700 h-2 overflow-hidden border-2 border-white">
              <div className="bg-white h-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-12">
            {currentExercise.repsOrTime === 'time' ? (
              <div className="text-center mb-6 sm:mb-8">
                <div className="text-7xl sm:text-8xl lg:text-9xl font-bold text-neutral-900 mb-4 sm:mb-6 font-mono">
                  {formatTime(timeLeft)}
                </div>
                <div className="flex justify-center gap-3 sm:gap-4">
                  <button
                    onClick={() => isRunning ? setIsRunning(false) : startTimer()}
                    className="border-2 border-neutral-900 bg-white text-neutral-900 p-4 sm:p-5 hover:bg-neutral-900 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5"
                  >
                    {isRunning ? <Pause className="w-6 h-6 sm:w-7 sm:h-7" /> : <Play className="w-6 h-6 sm:w-7 sm:h-7" />}
                  </button>
                  <button
                    onClick={() => {
                      setIsRunning(false);
                      setTimeLeft(currentExercise.timePerSet);
                    }}
                    className="border-2 border-neutral-900 bg-white text-neutral-900 p-4 sm:p-5 hover:bg-neutral-900 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5"
                  >
                    <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center mb-6 sm:mb-8">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-4 font-mono uppercase">
                  Target: {currentExercise.targetReps} Reps
                </div>
              </div>
            )}

            <SetLogger
              onComplete={handleSetComplete}
              repsOrTime={currentExercise.repsOrTime}
              isBodyweight={currentExercise.isBodyweight}
            />

            {currentExercise.notes && (
              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-2 border-neutral-900">
                <p className="text-xs sm:text-sm text-neutral-700 font-mono">
                  <span className="font-bold uppercase">Note:</span> {currentExercise.notes}
                </p>
              </div>
            )}
          </div>

          <div className="border-t-2 border-neutral-900 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-neutral-50">
            <h3 className="text-xs sm:text-sm uppercase tracking-wider text-neutral-900 mb-2 font-bold font-mono">Previous Sets</h3>
            {currentExerciseData.sets.length === 0 ? (
              <p className="text-neutral-500 text-xs sm:text-sm font-mono">No sets completed yet</p>
            ) : (
              <div className="space-y-1">
                {currentExerciseData.sets.map((set, idx) => (
                  <div key={idx} className="text-xs sm:text-sm text-neutral-700 font-mono">
                    SET {set.setNumber}: {set.reps ? `${set.reps} REPS` : 'COMPLETED'} {set.weight === null ? ' (BW)' : set.weight > 0 ? ` @ ${set.weight}LBS` : ''}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 sm:mt-6 bg-white border-2 border-neutral-900 p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xs sm:text-sm uppercase tracking-wider text-neutral-900 mb-2 sm:mb-3 font-bold font-mono">Up Next</h3>
          <div className="space-y-1 sm:space-y-2">
            {workout.exercises.slice(sessionData.currentExerciseIndex + 1).slice(0, 3).map((ex) => (
              <div key={ex.id} className="text-xs sm:text-sm text-neutral-700 truncate font-mono">
                {ex.name} - {ex.sets} SETS
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SetLogger = ({ onComplete, repsOrTime, isBodyweight }) => {
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(
      repsOrTime === 'reps' ? parseInt(reps) || 0 : null,
      isBodyweight ? null : (parseFloat(weight) || 0)
    );
    setReps('');
    setWeight('');
  };

  const handleKeyPress = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t-2 border-neutral-900 pt-6 sm:pt-8 space-y-4 sm:space-y-6">
      <div className={`grid gap-4 sm:gap-6 ${repsOrTime === 'reps' && !isBodyweight ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {repsOrTime === 'reps' && (
          <div className={!isBodyweight ? '' : 'col-span-1'}>
            <label className="block text-neutral-900 text-xs sm:text-sm uppercase tracking-wider mb-2 sm:mb-3 font-bold font-mono">
              Reps Completed
            </label>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="0"
              className="w-full border-b-4 border-neutral-900 bg-transparent px-0 py-2 sm:py-3 text-4xl sm:text-5xl font-bold text-neutral-900 text-center focus:outline-none font-mono"
              autoFocus
            />
          </div>
        )}
        {!isBodyweight && (
          <div className={repsOrTime === 'time' ? 'col-span-1' : ''}>
            <label className="block text-neutral-900 text-xs sm:text-sm uppercase tracking-wider mb-2 sm:mb-3 font-bold font-mono">
              Weight (lbs)
            </label>
            <input
              type="number"
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="0"
              className="w-full border-b-4 border-neutral-900 bg-transparent px-0 py-2 sm:py-3 text-4xl sm:text-5xl font-bold text-neutral-900 text-center focus:outline-none font-mono"
            />
          </div>
        )}
      </div>
      
      <button
        type="submit"
        className="w-full bg-neutral-900 text-white py-3 sm:py-4 text-xs sm:text-sm uppercase tracking-wider font-bold border-2 border-neutral-900 hover:bg-neutral-700 transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono"
      >
        Complete Set
        <ArrowRight className="w-4 h-4" />
      </button>
      
      <p className="text-center text-neutral-700 text-xs sm:text-sm font-mono">
        Press <kbd className="px-2 py-1 bg-neutral-200 border-2 border-neutral-900 text-xs font-mono font-bold">SPACE</kbd> or <kbd className="px-2 py-1 bg-neutral-200 border-2 border-neutral-900 text-xs font-mono font-bold">ENTER</kbd>
      </p>
    </form>
  );
};

const SessionComplete = ({ sessionData, workout, backToWorkouts, setCurrentModule }) => {
  const duration = Math.floor((sessionData.endTime - sessionData.startTime) / 1000);
  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}H ${m}M`;
    return `${m}M`;
  };

  const calculateVolume = (exerciseData) => {
    return exerciseData.sets.reduce((total, set) => {
      return total + (set.reps || 0) * (set.weight || 0);
    }, 0);
  };

  const calculatePRs = () => {
    const prs = [];
    sessionData.exerciseData.forEach((exData, idx) => {
      const exercise = workout.exercises[idx];
      const maxWeight = Math.max(...exData.sets.map(s => s.weight || 0));
      const maxReps = Math.max(...exData.sets.map(s => s.reps || 0));
      const totalVolume = calculateVolume(exData);
      
      if (maxWeight > 0 || maxReps > 0 || totalVolume > 0) {
        prs.push({
          exercise: exercise.name,
          maxWeight,
          maxReps,
          totalVolume
        });
      }
    });
    return prs;
  };

  const prs = calculatePRs();

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl w-full">
        <div className="bg-white border-2 border-neutral-900 p-6 sm:p-8 lg:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-center mb-6 sm:mb-8">
            <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">💪</div>
            <h1 className="text-3xl sm:text-4xl font-serif text-neutral-900 mb-2 uppercase">Complete!</h1>
            <p className="text-base sm:text-lg text-neutral-900 font-bold font-mono uppercase">{sessionData.workoutName}</p>
            <p className="text-sm sm:text-base text-neutral-700 mt-2 font-mono">Duration: {formatDuration(duration)}</p>
          </div>

          <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
            {prs.map((pr, idx) => (
              <div key={idx} className="border-2 border-neutral-900 p-4 sm:p-6 bg-neutral-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-3 sm:mb-4 truncate uppercase font-mono">{pr.exercise}</h3>
                <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
                  <div className="border-2 border-neutral-900 p-3 bg-white">
                    <div className="text-2xl sm:text-3xl font-bold text-neutral-900 font-mono">{pr.maxWeight}</div>
                    <div className="text-xs uppercase tracking-wider text-neutral-700 mt-1 font-mono font-bold">Max Weight</div>
                  </div>
                  <div className="border-2 border-neutral-900 p-3 bg-white">
                    <div className="text-2xl sm:text-3xl font-bold text-neutral-900 font-mono">{pr.maxReps}</div>
                    <div className="text-xs uppercase tracking-wider text-neutral-700 mt-1 font-mono font-bold">Max Reps</div>
                  </div>
                  <div className="border-2 border-neutral-900 p-3 bg-white">
                    <div className="text-2xl sm:text-3xl font-bold text-neutral-900 font-mono">{pr.totalVolume}</div>
                    <div className="text-xs uppercase tracking-wider text-neutral-700 mt-1 font-mono font-bold">Volume</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 sm:space-y-4">
            <button
              onClick={backToWorkouts}
              className="w-full bg-neutral-900 text-white py-3 sm:py-4 text-xs sm:text-sm uppercase tracking-wider font-bold border-2 border-neutral-900 hover:bg-neutral-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 font-mono"
            >
              Back to Workouts
            </button>
            <button
              onClick={() => setCurrentModule('dashboard')}
              className="w-full border-2 border-neutral-900 bg-white text-neutral-900 py-3 sm:py-4 text-xs sm:text-sm uppercase tracking-wider font-bold hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all font-mono"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const WorkoutHistory = ({ history, workouts, back, setCurrentModule }) => {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  };

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}H ${m}M`;
    return `${m}M`;
  };

  const calculateTotalVolume = (session) => {
    return session.exerciseData.reduce((total, exData) => {
      return total + exData.sets.reduce((exTotal, set) => {
        return exTotal + (set.reps || 0) * (set.weight || 0);
      }, 0);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-neutral-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => setCurrentModule('dashboard')}
          className="flex items-center gap-2 text-neutral-900 hover:bg-neutral-200 mb-6 sm:mb-8 transition-colors px-3 py-2 border-2 border-neutral-900"
        >
          <Home className="w-4 h-4" />
          <span className="text-xs sm:text-sm uppercase tracking-wider font-mono font-bold">Dashboard</span>
        </button>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-neutral-900 mb-2 uppercase">History</h1>
          <p className="text-sm sm:text-base lg:text-lg text-neutral-700 mb-4 sm:mb-0 font-mono font-bold">{history.length} WORKOUT{history.length !== 1 ? 'S' : ''} COMPLETED</p>
          <button
            onClick={back}
            className="mt-4 sm:mt-0 border-2 border-neutral-900 bg-white text-neutral-900 px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm uppercase tracking-wider font-bold hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all font-mono"
          >
            ← Back
          </button>
        </div>

        {history.length === 0 ? (
          <div className="bg-white border-2 border-neutral-900 p-8 sm:p-12 lg:p-16 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-neutral-900 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-serif text-neutral-900 mb-2 uppercase">No History Yet</h3>
            <p className="text-sm sm:text-base text-neutral-700 font-mono">Complete your first workout</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((session, idx) => {
              const workout = workouts.find(w => w.id === session.workoutId);
              const totalVolume = calculateTotalVolume(session);
              
              return (
                <div key={idx} className="bg-white border-2 border-neutral-900 p-4 sm:p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0 mb-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl sm:text-2xl font-serif text-neutral-900 mb-1 truncate uppercase">{session.workoutName}</h3>
                      <p className="text-neutral-700 text-xs sm:text-sm font-mono font-bold">{formatDate(session.startTime)}</p>
                    </div>
                    <div className="text-left sm:text-right border-2 border-neutral-900 p-2 bg-neutral-50">
                      <div className="text-base sm:text-lg text-neutral-900 font-bold font-mono">{formatDuration(session.duration)}</div>
                      <div className="text-neutral-700 text-xs sm:text-sm font-mono uppercase">Duration</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                    <div className="border-2 border-neutral-900 p-2 sm:p-3 text-center bg-neutral-50">
                      <div className="text-xl sm:text-2xl font-bold text-neutral-900 font-mono">{session.exerciseData.length}</div>
                      <div className="text-xs uppercase tracking-wider text-neutral-700 mt-1 font-mono font-bold">Exercises</div>
                    </div>
                    <div className="border-2 border-neutral-900 p-2 sm:p-3 text-center bg-neutral-50">
                      <div className="text-xl sm:text-2xl font-bold text-neutral-900 font-mono">
                        {session.exerciseData.reduce((total, ex) => total + ex.sets.length, 0)}
                      </div>
                      <div className="text-xs uppercase tracking-wider text-neutral-700 mt-1 font-mono font-bold">Total Sets</div>
                    </div>
                    <div className="border-2 border-neutral-900 p-2 sm:p-3 text-center bg-neutral-50">
                      <div className="text-xl sm:text-2xl font-bold text-neutral-900 font-mono">{totalVolume}</div>
                      <div className="text-xs uppercase tracking-wider text-neutral-700 mt-1 font-mono font-bold">Volume</div>
                    </div>
                    <div className="border-2 border-neutral-900 p-2 sm:p-3 text-center bg-neutral-50">
                      <div className="text-xl sm:text-2xl font-bold text-neutral-900 font-mono">
                        {Math.max(...session.exerciseData.flatMap(ex => ex.sets.map(s => s.weight || 0))) || 'BW'}
                      </div>
                      <div className="text-xs uppercase tracking-wider text-neutral-700 mt-1 font-mono font-bold">Max Weight</div>
                    </div>
                  </div>

                  <details className="mt-4">
                    <summary className="cursor-pointer text-neutral-900 hover:text-neutral-700 text-xs sm:text-sm uppercase tracking-wider font-mono font-bold border-2 border-neutral-900 p-2 bg-neutral-50 hover:bg-neutral-100 transition-colors">
                      View Details
                    </summary>
                    <div className="mt-4 space-y-4">
                      {session.exerciseData.map((exData, exIdx) => {
                        const exercise = workout?.exercises[exIdx];
                        return (
                          <div key={exIdx} className="border-t-2 border-neutral-900 pt-4">
                            <h4 className="font-bold text-sm sm:text-base text-neutral-900 mb-2 truncate font-mono uppercase">
                              {exercise?.name || `EXERCISE ${exIdx + 1}`}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {exData.sets.map((set, setIdx) => (
                                <div key={setIdx} className="bg-neutral-900 text-white px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-mono font-bold border-2 border-neutral-900">
                                  SET {set.setNumber}: {set.reps || 'OK'}
                                  {set.weight === null ? ' (BW)' : set.weight > 0 ? ` @ ${set.weight}LBS` : ''}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutTimer;