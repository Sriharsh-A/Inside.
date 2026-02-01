import React, { useState, useEffect } from 'react';
import { Check, Dumbbell, Flame, LogOut, LayoutGrid, Footprints, IndianRupee, Activity } from 'lucide-react';
import Onboarding from './Onboarding';
import Landing from './Landing';
import { useTheme } from './ThemeContext';

export default function App() {
  const [user, setUser] = useState(null);
  const [cycle, setCycle] = useState(null);
  const [data, setData] = useState(null);
  const [log, setLog] = useState({ workoutDone: false, dietFollowed: false, steps: 0, dietCost: 0 });
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const { theme, toggleTheme } = useTheme();

  // Load Session
  useEffect(() => {
    const savedId = localStorage.getItem('userId');
    if (savedId) {
      fetch(`http://localhost:3000/user/${savedId}`)
        .then(res => res.json())
        .then(res => {
          if (res.user) { setUser(res.user); setCycle(res.cycle); setShowLanding(false); }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else { setLoading(false); }
  }, []);

  // Load Data
  useEffect(() => {
    if (user && cycle) {
      fetch(`http://localhost:3000/today/${user.id}`)
        .then(res => res.json())
        .then(res => { setData(res); if (res.log) setLog(res.log); });
    }
  }, [user, cycle]);

  const updateData = async (type, value) => {
    setLog(prev => ({ ...prev, [type === 'cost' ? 'dietCost' : type]: value }));
    if (type === 'cost' && data) {
       setData(prev => ({ ...prev, totalSpent: (prev.totalSpent - log.dietCost) + Number(value) }));
    }
    await fetch('http://localhost:3000/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, type, value })
    });
  };

  const handleLogout = () => { localStorage.removeItem('userId'); setUser(null); setShowLanding(true); };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-zinc-500">Loading...</div>;
  
  if (!user) {
    if (showLanding) return <Landing onStart={() => setShowLanding(false)} />;
    return <Onboarding 
      onBack={() => setShowLanding(true)} 
      onComplete={(u, c) => { localStorage.setItem('userId', u.id); setUser(u); setCycle(c); }} 
    />;
  }

  if (!data) return <div className="h-screen bg-black flex items-center justify-center text-zinc-500">Syncing...</div>;

  // 1. COMPONENT: Goal Progress (Red/Black Theme)
  const renderDotGrid = () => {
    const totalDays = 30; 
    const daysLeft = 28 - (data.dayIndex + 1);
    const percentage = Math.round(((data.dayIndex + 1) / 28) * 100);

    return (
      <div className="bg-black border border-zinc-900 text-white p-6 rounded-3xl mb-6 shadow-2xl">
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Cycle Goal</h3>
        <div className="flex items-end gap-2 mb-6">
          <span className="text-6xl font-bold tracking-tighter">{percentage}%</span>
          <span className="text-accent mb-2 font-mono text-sm">{Math.max(0, daysLeft)} DAYS LEFT</span>
        </div>
        <div className="grid grid-cols-10 gap-2">
          {Array.from({ length: totalDays }).map((_, i) => {
            const isPast = i <= data.dayIndex;
            const isToday = i === data.dayIndex;
            return (
              <div key={i} className={`w-2 h-2 rounded-sm transition-all ${isToday ? 'bg-accent scale-150' : isPast ? 'bg-zinc-800' : 'bg-zinc-900'}`} />
            );
          })}
        </div>
      </div>
    );
  };

  // 2. COMPONENT: Consistency Heatmap (Red/Black Theme)
  const renderHeatmap = () => {
    return (
      <div className="bg-white dark:bg-black p-6 rounded-3xl border border-gray-100 dark:border-zinc-900 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-zinc-500"><Activity size={14}/> Consistency</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 30 }).map((_, i) => {
            const dateOffset = 29 - i;
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() - dateOffset);
            const dateStr = targetDate.toISOString().split('T')[0];
            const dayLog = data.history.find(h => h.date.startsWith(dateStr));
            const active = dayLog && (dayLog.workoutDone || dayLog.steps > 5000);
            
            return (
              <div key={i} title={dateStr} className={`w-3 h-3 rounded-sm transition-colors ${active ? 'bg-accent' : 'bg-gray-100 dark:bg-zinc-900'}`} />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans transition-colors duration-300 pb-12 selection:bg-accent selection:text-white">
      <nav className="fixed top-0 w-full bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-gray-100 dark:border-zinc-900 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black dark:bg-white rounded flex items-center justify-center text-white dark:text-black">
            <LayoutGrid size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight">Inside.</span>
        </div>
        <div className="flex gap-4">
          <button onClick={toggleTheme} className="hover:text-accent transition-colors">{theme === 'dark' ? '☀️' : '🌙'}</button>
          <button onClick={handleLogout} className="hover:text-accent transition-colors"><LogOut size={20} /></button>
        </div>
      </nav>

      <main className="max-w-xl mx-auto pt-28 px-6">
        <header className="mb-8">
           <h1 className="text-4xl font-extrabold tracking-tight">Hey, {user.name}.</h1>
           <div className="flex items-center gap-2 mt-2 text-zinc-500 text-sm font-medium">
             <Flame size={14} className="text-accent" />
             <span>Daily Target: <span className="text-black dark:text-white">{user.calorieTarget}</span> kcal</span>
           </div>
        </header>
        
        {renderDotGrid()}
        {renderHeatmap()}

        <div className="grid grid-cols-2 gap-4 mb-6">
           {/* STEPS - Accent Color Used for Icon */}
           <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-gray-100 dark:border-zinc-900">
              <div className="flex items-center gap-2 mb-2 text-accent"><Footprints size={20} /><span className="font-bold text-xs uppercase tracking-wider text-zinc-500">Steps</span></div>
              <input 
                type="number" 
                value={log.steps || ''}
                onChange={(e) => updateData('steps', e.target.value)}
                className="w-full bg-transparent text-3xl font-bold focus:outline-none placeholder:text-zinc-800"
                placeholder="0"
              />
           </div>

           {/* COST - Clean & Minimal */}
           <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-gray-100 dark:border-zinc-900">
              <div className="flex items-center gap-2 mb-2 text-white"><IndianRupee size={20} /><span className="font-bold text-xs uppercase tracking-wider text-zinc-500">Spent</span></div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg text-zinc-600">₹</span>
                <input 
                  type="number" 
                  value={log.dietCost || ''}
                  onChange={(e) => updateData('cost', e.target.value)}
                  className="w-full bg-transparent text-3xl font-bold focus:outline-none"
                  placeholder="0"
                />
              </div>
              <span className="text-xs text-zinc-500">Total: ₹{data.totalSpent || 0}</span>
           </div>
        </div>

        {/* WORKOUT CARD - The "Done" State is now Accent Red */}
        <section className={`bg-white dark:bg-zinc-950 rounded-3xl p-6 mb-6 border transition-all ${log.workoutDone ? 'border-accent/50' : 'border-gray-100 dark:border-zinc-900'}`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${log.workoutDone ? 'bg-accent text-white' : 'bg-black text-white dark:bg-white dark:text-black'}`}><Dumbbell size={24} /></div>
              <div>
                <h2 className="text-xl font-bold">Training</h2>
                <p className="text-sm text-zinc-500">Day {data.dayIndex + 1} • {log.workoutDone ? "Completed" : "Today's Session"}</p>
              </div>
            </div>
            <button onClick={() => updateData('workout', !log.workoutDone)} className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${log.workoutDone ? 'bg-accent border-accent text-white' : 'border-zinc-200 dark:border-zinc-800 text-zinc-300'}`}><Check size={24}/></button>
          </div>
          
          <div className={`space-y-3 ${log.workoutDone ? 'opacity-30 grayscale' : ''}`}>
            {data.workout.length > 0 ? (
              data.workout.map((ex, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-zinc-900 last:border-0">
                  <span className="font-medium text-gray-900 dark:text-gray-200">{ex.name}</span>
                  <span className="text-xs font-bold bg-gray-100 dark:bg-zinc-900 px-3 py-1 rounded text-gray-600 dark:text-zinc-500">{ex.sets} x {ex.reps}</span>
                </div>
              ))
            ) : <p className="text-zinc-500 italic">Active Recovery Day.</p>}
          </div>
        </section>

      </main>
    </div>
  );
}