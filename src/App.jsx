import React, { useState, useEffect } from 'react';
import { Analytics } from "@vercel/analytics/react";
import Dashboard from './Dashboard';
import PomodoroPlanner from './PomodoroPlanner';
import WorkoutTimer from './WorkoutTimer';
import Habits from './Habits';
import Timetable from './Timetable';
import Schedule from './Schedule';
import Finance from './Finance';
import Statistics from './Statistics';
// import DesktopPet from './Pet';

const App = () => {
  const [currentModule, setCurrentModule] = useState('dashboard');

  useEffect(() => {
    const savedModule = localStorage.getItem('currentModule');
    if (savedModule) {
      setCurrentModule(savedModule);
    }
  }, []);

  const changeModule = (module) => {
    setCurrentModule(module);
    localStorage.setItem('currentModule', module);
  };

  

  return (
    <div>
      {currentModule === 'dashboard' && <Dashboard setCurrentModule={changeModule} />}
      {currentModule === 'pomodoro' && <PomodoroPlanner setCurrentModule={changeModule} />}
      {currentModule === 'workout' && <WorkoutTimer setCurrentModule={changeModule} />}
      {currentModule === 'habits' && <Habits setCurrentModule={changeModule} />}
      {currentModule === 'timetable' && <Timetable setCurrentModule={changeModule} />}
      {currentModule === 'schedule' && <Schedule setCurrentModule={changeModule} />}
      {currentModule === 'finance' && <Finance setCurrentModule={changeModule} />}
      {currentModule === 'statistics' && <Statistics setCurrentModule={changeModule} />}
      
      {/* Desktop Pet - persists across all modules
      <DesktopPet /> */}
      <Analytics />
    </div>
  );
};

export default App;

const style = document.createElement('style');
style.textContent = `
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  
  
  @keyframes scale-in {
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1);
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
  
  .animate-slide-up {
    animation: slide-up 0.4s ease-out forwards;
    opacity: 0;
  }
  
  .animate-slide-down {
    animation: slide-down 0.3s ease-out;
  }
  
  .animate-scale-in {
    animation: scale-in 0.2s ease-out;
  }
`;
document.head.appendChild(style);