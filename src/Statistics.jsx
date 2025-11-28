import React, { useState, useEffect } from 'react';
import { Home, Clock, Target, Dumbbell, Award, Flame, BarChart3, Zap, Heart, Star, Calendar, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Statistics = ({ setCurrentModule }) => {
  const [timeRange, setTimeRange] = useState('week');
  const [stats, setStats] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [productivityScore, setProductivityScore] = useState(0);
  const [encouragement, setEncouragement] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const getEncouragingMessage = (score) => {
    if (score === 0) {
      const messages = [
        "Every journey starts with a single step. Today is your day! 🌟",
        "Rest is productive too. When you're ready, you've got this! 💪",
        "New beginnings are beautiful. Let's make today count! ✨",
        "Your potential is unlimited. Start small, dream big! 🚀",
        "Taking it slow? That's okay. Progress over perfection! 🌱"
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    } else if (score < 30) {
      const messages = [
        "You're showing up! That's what matters most. Keep going! 🌟",
        "Small steps lead to big changes. You're on the right track! 🎯",
        "Building momentum one task at a time. Proud of you! 💫",
        "Every effort counts. You're doing better than you think! 🌈",
        "The fact that you started is already a win! Keep it up! 🏆"
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    } else if (score < 50) {
      const messages = [
        "You're finding your rhythm! This is great progress! 🎵",
        "Consistency is key, and you're nailing it! Keep going! 🔥",
        "Look at you go! Your dedication is inspiring! 💪",
        "You're building something amazing here. Keep pushing! 🌟",
        "Solid work! You're stronger than yesterday! 🚀"
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    } else if (score < 75) {
      const messages = [
        "Impressive! You're in the zone and crushing it! 🔥",
        "Your hard work is paying off big time! Amazing! 🏆",
        "You're on fire! This is the momentum we love to see! ⚡",
        "Excellence in action! Keep this energy going! 🌟",
        "You're a productivity powerhouse today! Incredible! 💎"
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    } else {
      const messages = [
        "LEGENDARY! You're absolutely unstoppable today! 🏆🔥",
        "Peak performance unlocked! You're a superstar! ⭐✨",
        "Phenomenal work! You're setting the bar high! 🚀💪",
        "This is what excellence looks like! Outstanding! 👑💎",
        "You're crushing it at the highest level! Incredible! ⚡🌟"
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
  };

  const calculateProductivityScore = (pomodoros, habits, workouts, startDate) => {
    const days = getDaysSince(startDate);
    if (days === 0) return 0;
    
    const pomodoroPoints = pomodoros.length * 10;
    const habitPoints = Object.keys(habits).length * 15;
    const workoutPoints = workouts.length * 25;
    
    const totalPoints = pomodoroPoints + habitPoints + workoutPoints;
    const maxPossiblePoints = days * 100;
    
    const score = Math.min(Math.round((totalPoints / maxPossiblePoints) * 100), 100);
    return score;
  };

  const generateHeatmapData = () => {
    const pomodoros = JSON.parse(localStorage.getItem('pomodoroCompletions') || '[]');
    const habitCompletions = JSON.parse(localStorage.getItem('habitCompletions') || '{}');
    const workouts = JSON.parse(localStorage.getItem('workoutHistory') || '[]');

    const heatmap = [];
    const today = new Date();
    
    for (let i = 83; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dateStr = date.toDateString();
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayPomodoros = pomodoros.filter(p => {
        const pDate = new Date(p.timestamp);
        return pDate >= date && pDate < nextDate;
      }).length;
      
      const dayHabits = Object.keys(habitCompletions).filter(key => {
        return key.startsWith(dateStr) && habitCompletions[key];
      }).length;
      
      const dayWorkouts = workouts.filter(w => {
        const wDate = new Date(w.startTime);
        return wDate >= date && wDate < nextDate;
      }).length;
      
      const totalActivity = dayPomodoros + (dayHabits * 2) + (dayWorkouts * 3);
      let intensity = 0;
      if (totalActivity > 0) intensity = 1;
      if (totalActivity >= 5) intensity = 2;
      if (totalActivity >= 10) intensity = 3;
      if (totalActivity >= 15) intensity = 4;
      
      heatmap.push({
        date: date.toISOString().split('T')[0],
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dayOfWeek: date.getDay(),
        intensity,
        activities: {
          pomodoros: dayPomodoros,
          habits: dayHabits,
          workouts: dayWorkouts,
          total: totalActivity
        }
      });
    }
    
    return heatmap;
  };

  const loadStats = () => {
    const pomodoros = JSON.parse(localStorage.getItem('pomodoroCompletions') || '[]');
    const habits = JSON.parse(localStorage.getItem('habits') || '[]');
    const habitCompletions = JSON.parse(localStorage.getItem('habitCompletions') || '{}');
    const workouts = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

    const now = new Date();
    const startDate = getStartDate(now, timeRange);

    setDateRange({
      start: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      end: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });

    const filteredPomodoros = pomodoros.filter(p => new Date(p.timestamp) >= startDate);
    const filteredWorkouts = workouts.filter(w => new Date(w.startTime) >= startDate);
    const filteredTransactions = transactions.filter(t => new Date(t.date) >= startDate);
    const filteredHabitCompletions = Object.fromEntries(
      Object.entries(habitCompletions).filter(([key]) => {
        const date = key.split('_')[0];
        return new Date(date) >= startDate;
      })
    );

    const pomodoroStats = calculatePomodoroStats(filteredPomodoros);
    const habitStats = calculateHabitStats(habits, habitCompletions, startDate);
    const workoutStats = calculateWorkoutStats(filteredWorkouts);
    const assignmentStats = calculateAssignmentStats(assignments);
    const financeStats = calculateFinanceStats(filteredTransactions);

    const score = calculateProductivityScore(
      filteredPomodoros,
      filteredHabitCompletions,
      filteredWorkouts,
      startDate
    );

    setProductivityScore(score);
    setEncouragement(getEncouragingMessage(score));
    setHeatmapData(generateHeatmapData());

    setStats({
      pomodoro: pomodoroStats,
      habits: habitStats,
      workouts: workoutStats,
      assignments: assignmentStats,
      finance: financeStats,
      overview: {
        totalPomodoros: filteredPomodoros.length,
        totalWorkouts: filteredWorkouts.length,
        habitCompletionRate: habitStats.completionRate,
        assignmentsOnTime: assignmentStats.onTimeRate
      }
    });
  };

  const getStartDate = (now, range) => {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    if (range === 'week') {
      date.setDate(date.getDate() - 7);
    } else if (range === 'month') {
      date.setMonth(date.getMonth() - 1);
    } else {
      date.setFullYear(date.getFullYear() - 1);
    }
    return date;
  };

  const calculatePomodoroStats = (pomodoros) => {
    const byDay = {};
    pomodoros.forEach(p => {
      const day = new Date(p.timestamp).toLocaleDateString();
      byDay[day] = (byDay[day] || 0) + 1;
    });

    const byHour = {};
    pomodoros.forEach(p => {
      const hour = new Date(p.timestamp).getHours();
      byHour[hour] = (byHour[hour] || 0) + 1;
    });

    const days = Object.keys(byDay).length || 1;
    const avgPerDay = pomodoros.length / days;

    const mostProductiveHour = Object.entries(byHour).sort(([,a], [,b]) => b - a)[0];

    const dailyData = Object.entries(byDay)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sessions: count
      }));

    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      sessions: byHour[i] || 0,
      label: `${i}:00`
    }));

    return {
      total: pomodoros.length,
      avgPerDay: avgPerDay.toFixed(1),
      mostProductiveHour: mostProductiveHour ? `${mostProductiveHour[0]}:00` : 'N/A',
      dailyData,
      hourlyData: hourlyData.filter(h => h.sessions > 0),
      totalMinutes: pomodoros.length * 25
    };
  };

  const calculateHabitStats = (habits, completions, startDate) => {
    if (habits.length === 0) {
      return { completionRate: 0, streaks: [], performanceData: [] };
    }

    const totalPossible = habits.length * getDaysSince(startDate);
    const totalCompleted = Object.entries(completions).filter(([key, val]) => {
      const date = key.split('_')[0];
      return val && new Date(date) >= startDate;
    }).length;

    const completionRate = totalPossible > 0 ? ((totalCompleted / totalPossible) * 100).toFixed(1) : 0;

    const streaks = habits.map(habit => {
      let currentStreak = 0;
      let maxStreak = 0;
      let tempStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let streakBroken = false;
      for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const key = `${date.toDateString()}_${habit.id}`;
        
        if (completions[key]) {
          tempStreak++;
          maxStreak = Math.max(maxStreak, tempStreak);
          if (!streakBroken) {
            currentStreak = tempStreak;
          }
        } else {
          if (!streakBroken) {
            streakBroken = true;
          }
          tempStreak = 0;
        }
      }

      return {
        name: habit.name,
        currentStreak,
        maxStreak: Math.max(maxStreak, currentStreak)
      };
    });

    const performanceData = habits.map(habit => {
      const habitCompletions = Object.entries(completions).filter(([key, val]) => {
        return key.includes(`_${habit.id}`) && val && new Date(key.split('_')[0]) >= startDate;
      }).length;
      
      const daysSinceStart = getDaysSince(startDate);
      
      return {
        name: habit.name,
        completions: habitCompletions,
        rate: daysSinceStart > 0 ? ((habitCompletions / daysSinceStart) * 100).toFixed(0) : 0
      };
    });

    return {
      completionRate,
      streaks,
      performanceData
    };
  };

  const calculateWorkoutStats = (workouts) => {
    if (workouts.length === 0) {
      return { total: 0, totalVolume: 0, avgDuration: 0, frequencyData: [] };
    }

    const totalVolume = workouts.reduce((sum, w) => {
      return sum + w.exerciseData.reduce((eSum, ex) => {
        return eSum + ex.sets.reduce((sSum, set) => {
          return sSum + ((set.reps || 0) * (set.weight || 0));
        }, 0);
      }, 0);
    }, 0);

    const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const avgDuration = Math.round(totalDuration / workouts.length / 60);

    const byDay = {};
    workouts.forEach(w => {
      const day = new Date(w.startTime).toLocaleDateString();
      byDay[day] = (byDay[day] || 0) + 1;
    });

    const frequencyData = Object.entries(byDay)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        workouts: count
      }));

    return {
      total: workouts.length,
      totalVolume,
      avgDuration,
      frequencyData,
      totalMinutes: Math.round(totalDuration / 60)
    };
  };

  const calculateAssignmentStats = (assignments) => {
    if (assignments.length === 0) {
      return { total: 0, completed: 0, onTimeRate: 0, upcoming: 0 };
    }

    const completed = assignments.filter(a => a.status === 'completed').length;
    const onTime = assignments.filter(a => {
      if (a.status !== 'completed') return false;
      return true;
    }).length;
    
    const onTimeRate = completed > 0 ? ((onTime / completed) * 100).toFixed(0) : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = assignments.filter(a => {
      return a.deadline && new Date(a.deadline) >= today && a.status !== 'completed';
    }).length;

    return {
      total: assignments.length,
      completed,
      onTimeRate,
      upcoming
    };
  };

  const calculateFinanceStats = (transactions) => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const byCategory = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        byCategory[t.category] = (byCategory[t.category] || 0) + parseFloat(t.amount);
      });

    const categoryData = Object.entries(byCategory).map(([category, amount]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: amount
    }));

    return {
      income,
      expenses,
      balance: income - expenses,
      categoryData
    };
  };

  const getDaysSince = (startDate) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getIntensityColor = (intensity) => {
    const colors = {
      0: '#f5f5f5',
      1: '#fed7aa',
      2: '#fb923c',
      3: '#f97316',
      4: '#c2410c'
    };
    return colors[intensity] || colors[0];
  };

  if (!stats) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-neutral-400 mx-auto mb-4 border-4 border-neutral-900 p-2" />
          <div className="text-neutral-900 font-mono font-bold uppercase">Loading statistics...</div>
        </div>
      </div>
    );
  }

  const COLORS = ['#f97316', '#3b82f6', '#a855f7', '#ec4899', '#ef4444', '#6b7280'];

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
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-neutral-900">STATISTICS</h1>
            <BarChart3 className="w-6 h-6 text-neutral-900" />
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-700 font-mono mb-4">
            <Calendar className="w-4 h-4" />
            <span className="font-bold uppercase">{dateRange.start} - {dateRange.end}</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setTimeRange('week')}
              className={`flex-1 sm:flex-none px-4 py-3 text-xs sm:text-sm uppercase tracking-wider font-bold transition-all border-2 border-neutral-900 font-mono ${
                timeRange === 'week'
                  ? 'bg-neutral-900 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white text-neutral-900 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`flex-1 sm:flex-none px-4 py-3 text-xs sm:text-sm uppercase tracking-wider font-bold transition-all border-2 border-neutral-900 font-mono ${
                timeRange === 'month'
                  ? 'bg-neutral-900 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white text-neutral-900 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`flex-1 sm:flex-none px-4 py-3 text-xs sm:text-sm uppercase tracking-wider font-bold transition-all border-2 border-neutral-900 font-mono ${
                timeRange === 'all'
                  ? 'bg-neutral-900 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white text-neutral-900 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5'
              }`}
            >
              1 Year
            </button>
          </div>
        </div>

        {/* Productivity Score */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-6 sm:p-8 mb-6 border-4 border-neutral-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-3 mb-4 border-b-2 border-white pb-3">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8" />
                <h2 className="text-2xl sm:text-3xl font-serif uppercase">Productivity Score</h2>
              </div>
              <div className="text-5xl sm:text-7xl font-bold mb-4 font-mono">{productivityScore}/100</div>
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-sm sm:text-xl font-bold">{encouragement}</span>
              </div>
              
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="flex items-center gap-2 text-sm mb-3 hover:opacity-80 transition-opacity font-mono font-bold border-2 border-white px-3 py-2 hover:bg-white hover:text-orange-500"
              >
                {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                <span>{showBreakdown ? 'HIDE' : 'SHOW'} SCORE BREAKDOWN</span>
              </button>

              {showBreakdown && (
                <div className="bg-black bg-opacity-30 p-4 mb-4 text-sm border-2 border-white font-mono">
                  <div className="font-bold mb-2 uppercase">How the score is calculated:</div>
                  <div className="space-y-1 font-bold">
                    <div>• POMODOROS: {stats.overview.totalPomodoros} sessions × 10 pts = {stats.overview.totalPomodoros * 10} pts</div>
                    <div>• HABITS: {Object.keys(stats.habits.performanceData).length} completed × 15 pts</div>
                    <div>• WORKOUTS: {stats.overview.totalWorkouts} sessions × 25 pts = {stats.overview.totalWorkouts * 25} pts</div>
                    <div className="pt-2 border-t-2 border-white mt-2">
                      MAX POSSIBLE: {getDaysSince(getStartDate(new Date(), timeRange)) * 100} pts (100 pts/day for {getDaysSince(getStartDate(new Date(), timeRange))} days)
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white bg-opacity-30 h-4 overflow-hidden border-2 border-white">
                <div
                  className="bg-white h-full transition-all duration-1000"
                  style={{ width: `${productivityScore}%` }}
                />
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <Star className="w-16 h-16 ml-auto mb-2 border-4 border-white p-2" />
              <div className="text-sm uppercase tracking-wider font-bold font-mono">Keep Shining</div>
            </div>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="bg-white border-4 border-neutral-900 p-4 sm:p-8 mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4 border-b-4 border-neutral-900 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif text-neutral-900 mb-1 uppercase">Activity Heatmap</h2>
              <p className="text-xs sm:text-sm text-neutral-700 font-mono font-bold uppercase">Last 12 weeks • Hover for details</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 text-xs text-neutral-900 font-mono font-bold">
              <span className="uppercase">Less</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-neutral-900"
                    style={{ backgroundColor: getIntensityColor(i) }}
                  />
                ))}
              </div>
              <span className="uppercase">More</span>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="inline-block min-w-full">
              <div className="flex gap-1">
                {Array.from({ length: 12 }, (_, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, dayIndex) => {
                      const dataIndex = weekIndex * 7 + dayIndex;
                      const dayData = heatmapData[dataIndex];
                      
                      return (
                        <div key={dayIndex} className="relative group">
                          <div
                            className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-neutral-900 cursor-pointer hover:ring-4 hover:ring-orange-500 transition-all"
                            style={{
                              backgroundColor: dayData ? getIntensityColor(dayData.intensity) : '#f5f5f5'
                            }}
                          />
                          {dayData && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 text-white text-xs border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-mono font-bold">
                              <div className="font-bold mb-1 uppercase">{dayData.displayDate}</div>
                              <div>🍅 {dayData.activities.pomodoros} POMODOROS</div>
                              <div>🎯 {dayData.activities.habits} HABITS</div>
                              <div>💪 {dayData.activities.workouts} WORKOUTS</div>
                              <div className="border-t-2 border-white mt-1 pt-1">
                                TOTAL: {dayData.activities.total} ACTIVITIES
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="flex gap-1 mt-2">
                {Array.from({ length: 12 }, (_, weekIndex) => {
                  const firstDayOfWeek = heatmapData[weekIndex * 7];
                  return (
                    <div key={weekIndex} className="w-4 sm:w-5 text-xs text-neutral-900 text-center font-mono font-bold">
                      {firstDayOfWeek && weekIndex % 2 === 0 ? (
                        new Date(firstDayOfWeek.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
                      ) : ''}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
          <div className="bg-white border-4 border-neutral-900 p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between mb-2 border-b-2 border-neutral-900 pb-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              <span className="text-2xl sm:text-3xl font-bold text-neutral-900 font-mono">{stats.overview.totalPomodoros}</span>
            </div>
            <div className="text-xs sm:text-sm text-neutral-900 mb-1 font-mono font-bold uppercase">Focus Sessions</div>
            <div className="text-xs text-neutral-700 font-mono">
              {stats.pomodoro.totalMinutes} mins total
            </div>
            <div className="text-xs text-neutral-700 font-mono">
              Avg {stats.pomodoro.avgPerDay}/day
            </div>
          </div>

          <div className="bg-white border-4 border-neutral-900 p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between mb-2 border-b-2 border-neutral-900 pb-2">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              <span className="text-2xl sm:text-3xl font-bold text-neutral-900 font-mono">{stats.overview.habitCompletionRate}%</span>
            </div>
            <div className="text-xs sm:text-sm text-neutral-900 mb-1 font-mono font-bold uppercase">Habit Rate</div>
            <div className="text-xs text-neutral-700 font-mono">
              Overall completion
            </div>
          </div>

          <div className="bg-white border-4 border-neutral-900 p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between mb-2 border-b-2 border-neutral-900 pb-2">
              <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              <span className="text-2xl sm:text-3xl font-bold text-neutral-900 font-mono">{stats.overview.totalWorkouts}</span>
            </div>
            <div className="text-xs sm:text-sm text-neutral-900 mb-1 font-mono font-bold uppercase">Workouts</div>
            <div className="text-xs text-neutral-700 font-mono">
              {stats.workouts.totalMinutes} mins total
            </div>
            <div className="text-xs text-neutral-700 font-mono">
              {stats.workouts.avgDuration}min avg
            </div>
          </div>

          <div className="bg-white border-4 border-neutral-900 p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between mb-2 border-b-2 border-neutral-900 pb-2">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
              <span className="text-2xl sm:text-3xl font-bold text-neutral-900 font-mono">{stats.overview.assignmentsOnTime}%</span>
            </div>
            <div className="text-xs sm:text-sm text-neutral-900 mb-1 font-mono font-bold uppercase">On-Time Rate</div>
            <div className="text-xs text-neutral-700 font-mono">
              {stats.assignments.completed} completed
            </div>
          </div>
        </div>

        {/* Pomodoro Section */}
        {stats.pomodoro.total > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4 border-b-4 border-neutral-900 pb-2">
              <h2 className="text-xl sm:text-2xl font-serif text-neutral-900 uppercase">🍅 Focus Sessions</h2>
              <span className="text-sm text-neutral-700 font-mono font-bold">({stats.pomodoro.total} sessions, {stats.pomodoro.totalMinutes} minutes)</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white border-4 border-neutral-900 p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2 font-mono uppercase">Daily Activity</h3>
                <p className="text-xs text-neutral-700 mb-4 font-mono">Sessions completed each day in this period</p>
                {stats.pomodoro.dailyData.length > 0 ? (
                  <div className="h-[200px] sm:h-[250px] border-2 border-neutral-900 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.pomodoro.dailyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeWidth={2} />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="sessions" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[200px] sm:h-[250px] flex items-center justify-center text-neutral-500 border-2 border-neutral-900 font-mono font-bold">
                    NO DATA AVAILABLE
                  </div>
                )}
              </div>

              <div className="bg-white border-4 border-neutral-900 p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2 font-mono uppercase">Most Productive Hours</h3>
                <p className="text-xs text-neutral-700 mb-4 font-mono">When you focus best during the day</p>
                {stats.pomodoro.hourlyData.length > 0 ? (
                  <div className="h-[200px] sm:h-[250px] border-2 border-neutral-900 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.pomodoro.hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeWidth={2} />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <Tooltip />
                        <Bar dataKey="sessions" fill="#f97316" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[200px] sm:h-[250px] flex items-center justify-center text-neutral-500 border-2 border-neutral-900 font-mono font-bold">
                    NO DATA AVAILABLE
                  </div>
                )}
                <div className="mt-4 text-xs sm:text-sm text-neutral-900 text-center font-mono font-bold border-2 border-neutral-900 py-2 bg-orange-100">
                  PEAK: {stats.pomodoro.mostProductiveHour}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Habits Section */}
        {stats.habits.streaks.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4 border-b-4 border-neutral-900 pb-2">
              <h2 className="text-xl sm:text-2xl font-serif text-neutral-900 uppercase">🎯 Habits</h2>
              <span className="text-sm text-neutral-700 font-mono font-bold">({stats.habits.completionRate}% completion rate)</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white border-4 border-neutral-900 p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2 font-mono uppercase">Current Streaks</h3>
                <p className="text-xs text-neutral-700 mb-4 font-mono">Consecutive days completing each habit</p>
                <div className="space-y-4">
                  {stats.habits.streaks.map((streak, idx) => (
                    <div key={idx} className="border-2 border-neutral-900 p-3 bg-neutral-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-900 truncate pr-2 font-mono font-bold uppercase">{streak.name}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Flame className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-bold text-neutral-900 font-mono">{streak.currentStreak} DAYS</span>
                        </div>
                      </div>
                      <div className="bg-neutral-200 h-3 overflow-hidden border-2 border-neutral-900">
                        <div
                          className="bg-orange-500 h-full transition-all"
                          style={{ width: `${streak.maxStreak > 0 ? Math.min((streak.currentStreak / streak.maxStreak) * 100, 100) : 0}%` }}
                        />
                      </div>
                      <div className="text-xs text-neutral-700 mt-1 font-mono font-bold">
                        BEST STREAK: {streak.maxStreak} DAYS
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border-4 border-neutral-900 p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2 font-mono uppercase">Completion Rate by Habit</h3>
                <p className="text-xs text-neutral-700 mb-4 font-mono">Percentage of days each habit was completed</p>
                {stats.habits.performanceData.length > 0 ? (
                  <div className="h-[200px] sm:h-[250px] border-2 border-neutral-900 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.habits.performanceData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeWidth={2} />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <Tooltip />
                        <Bar dataKey="rate" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[200px] sm:h-[250px] flex items-center justify-center text-neutral-500 border-2 border-neutral-900 font-mono font-bold">
                    NO DATA AVAILABLE
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Workouts Section */}
        {stats.workouts.total > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4 border-b-4 border-neutral-900 pb-2">
              <h2 className="text-xl sm:text-2xl font-serif text-neutral-900 uppercase">💪 Workouts</h2>
              <span className="text-sm text-neutral-700 font-mono font-bold">({stats.workouts.total} sessions, {stats.workouts.totalMinutes} minutes)</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white border-4 border-neutral-900 p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2 font-mono uppercase">Workout Frequency</h3>
                <p className="text-xs text-neutral-700 mb-4 font-mono">Number of workouts completed each day</p>
                {stats.workouts.frequencyData.length > 0 ? (
                  <div className="h-[200px] sm:h-[250px] border-2 border-neutral-900 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.workouts.frequencyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeWidth={2} />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <Tooltip />
                        <Bar dataKey="workouts" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[200px] sm:h-[250px] flex items-center justify-center text-neutral-500 border-2 border-neutral-900 font-mono font-bold">
                    NO DATA AVAILABLE
                  </div>
                )}
              </div>

              <div className="bg-white border-4 border-neutral-900 p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2 font-mono uppercase">Summary</h3>
                <p className="text-xs text-neutral-700 mb-4 font-mono">Overall workout statistics for this period</p>
                <div className="space-y-4 sm:space-y-6">
                  <div className="border-2 border-neutral-900 p-3 bg-red-50">
                    <div className="text-xs sm:text-sm text-neutral-900 mb-2 font-mono font-bold uppercase">Total Volume</div>
                    <div className="text-2xl sm:text-3xl font-bold text-neutral-900 font-mono">{stats.workouts.totalVolume.toLocaleString()}</div>
                    <div className="text-xs text-neutral-700 font-mono">lbs lifted (reps × weight)</div>
                  </div>
                  <div className="border-2 border-neutral-900 p-3 bg-red-50">
                    <div className="text-xs sm:text-sm text-neutral-900 mb-2 font-mono font-bold uppercase">Average Duration</div>
                    <div className="text-2xl sm:text-3xl font-bold text-neutral-900 font-mono">{stats.workouts.avgDuration}</div>
                    <div className="text-xs text-neutral-700 font-mono">minutes per workout</div>
                  </div>
                  <div className="border-2 border-neutral-900 p-3 bg-red-50">
                    <div className="text-xs sm:text-sm text-neutral-900 mb-2 font-mono font-bold uppercase">Total Workouts</div>
                    <div className="text-2xl sm:text-3xl font-bold text-neutral-900 font-mono">{stats.workouts.total}</div>
                    <div className="text-xs text-neutral-700 font-mono">completed in this period</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Finance Section */}
        {stats.finance.categoryData.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4 border-b-4 border-neutral-900 pb-2">
              <h2 className="text-xl sm:text-2xl font-serif text-neutral-900 uppercase">💰 Finance</h2>
              <span className="text-sm text-neutral-700 font-mono font-bold">(Balance: ${stats.finance.balance.toFixed(2)})</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white border-4 border-neutral-900 p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2 font-mono uppercase">Spending by Category</h3>
                <p className="text-xs text-neutral-700 mb-4 font-mono">Breakdown of expenses by category</p>
                <div className="h-[250px] sm:h-[300px] border-2 border-neutral-900 p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.finance.categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.finance.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border-4 border-neutral-900 p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2 font-mono uppercase">Financial Summary</h3>
                <p className="text-xs text-neutral-700 mb-4 font-mono">Income, expenses, and balance for this period</p>
                <div className="space-y-4 sm:space-y-6">
                  <div className="border-2 border-neutral-900 p-3 bg-green-50">
                    <div className="text-xs sm:text-sm text-neutral-900 mb-2 font-mono font-bold uppercase">Total Income</div>
                    <div className="text-2xl sm:text-3xl font-bold text-green-600 font-mono">${stats.finance.income.toFixed(2)}</div>
                    <div className="text-xs text-neutral-700 font-mono">Money earned</div>
                  </div>
                  <div className="border-2 border-neutral-900 p-3 bg-red-50">
                    <div className="text-xs sm:text-sm text-neutral-900 mb-2 font-mono font-bold uppercase">Total Expenses</div>
                    <div className="text-2xl sm:text-3xl font-bold text-red-600 font-mono">${stats.finance.expenses.toFixed(2)}</div>
                    <div className="text-xs text-neutral-700 font-mono">Money spent</div>
                  </div>
                  <div className={`border-4 border-neutral-900 p-3 ${stats.finance.balance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <div className="text-xs sm:text-sm text-neutral-900 mb-2 font-mono font-bold uppercase">Net Balance</div>
                    <div className={`text-2xl sm:text-3xl font-bold font-mono ${stats.finance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${stats.finance.balance.toFixed(2)}
                    </div>
                    <div className="text-xs text-neutral-700 font-mono">Income minus expenses</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assignments Summary */}
        {stats.assignments.total > 0 && (
          <div className="bg-white border-4 border-neutral-900 p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6">
            <div className="flex items-center gap-3 mb-4 border-b-4 border-neutral-900 pb-3">
              <h2 className="text-xl sm:text-2xl font-serif text-neutral-900 uppercase">📚 Assignments</h2>
              <span className="text-sm text-neutral-700 font-mono font-bold">({stats.assignments.total} total assignments)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center border-2 border-neutral-900 p-4 bg-neutral-50">
                <div className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2 font-mono">{stats.assignments.total}</div>
                <div className="text-xs sm:text-sm text-neutral-900 mb-1 font-mono font-bold uppercase">Total</div>
                <div className="text-xs text-neutral-700 font-mono">All assignments</div>
              </div>
              <div className="text-center border-2 border-neutral-900 p-4 bg-green-50">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2 font-mono">{stats.assignments.completed}</div>
                <div className="text-xs sm:text-sm text-neutral-900 mb-1 font-mono font-bold uppercase">Completed</div>
                <div className="text-xs text-neutral-700 font-mono">Finished tasks</div>
              </div>
              <div className="text-center border-2 border-neutral-900 p-4 bg-orange-50">
                <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-2 font-mono">{stats.assignments.upcoming}</div>
                <div className="text-xs sm:text-sm text-neutral-900 mb-1 font-mono font-bold uppercase">Upcoming</div>
                <div className="text-xs text-neutral-700 font-mono">Due soon</div>
              </div>
              <div className="text-center border-2 border-neutral-900 p-4 bg-blue-50">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2 font-mono">{stats.assignments.onTimeRate}%</div>
                <div className="text-xs sm:text-sm text-neutral-900 mb-1 font-mono font-bold uppercase">On-Time Rate</div>
                <div className="text-xs text-neutral-700 font-mono">Completion rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {stats.pomodoro.total === 0 && stats.habits.streaks.length === 0 && stats.workouts.total === 0 && stats.assignments.total === 0 && (
          <div className="bg-white border-4 border-neutral-900 p-12 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <TrendingUp className="w-16 h-16 text-neutral-400 mx-auto mb-4 border-4 border-neutral-900 p-2" />
            <h3 className="text-xl font-serif text-neutral-900 mb-2 uppercase">No Data Yet</h3>
            <p className="text-neutral-700 mb-6 font-mono font-bold">START COMPLETING POMODOROS, HABITS, WORKOUTS, AND ASSIGNMENTS TO SEE YOUR STATISTICS HERE.</p>
            <button
              onClick={() => setCurrentModule('dashboard')}
              className="px-6 py-3 bg-neutral-900 text-white hover:bg-neutral-700 transition-colors border-2 border-neutral-900 font-mono font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;