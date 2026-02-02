import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Check, Dumbbell, Flame, LogOut, Footprints, IndianRupee, 
  Activity, Parentheses, Moon, Sun, Play, Wallet, Scale, 
  Home, Calendar, User, BarChart3, Utensils
} from 'lucide-react';
import Onboarding from './Onboarding';
import Landing from './Landing';
import { useTheme } from './ThemeContext';
import { usePedometer } from './usePedometer';

export default function App() {
  const [user, setUser] = useState(null);
  const [cycle, setCycle] = useState(null);
  const [data, setData] = useState(null);
  const [log, setLog] = useState({ workoutDone: false, dietFollowed: false, steps: 0, dietCost: 0, currentWeight: 0 });
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const { theme, toggleTheme } = useTheme();
  const { liveSteps, requestPermission, permissionGranted } = usePedometer();
  const initialStepsRef = useRef(0);

  // --- 1. SESSION CHECK ---
  useEffect(() => {
    const savedId = localStorage.getItem('userId');
    if (savedId) {
      fetch(`http://localhost:3000/user/${savedId}`)
        .then(res => res.json())
        .then(res => {
          if (res.user) { setUser(res.user); setCycle(res.cycle); setShowLanding(false); }
          else { localStorage.removeItem('userId'); }
          setLoading(false);
        })
        .catch(() => { setLoading(false); });
    } else { setLoading(false); }
  }, []);

  // --- 2. SMART DATA FETCHING ---
  const refreshData = useCallback(() => {
    if (user && cycle) {
      fetch(`http://localhost:3000/today/${user.id}`)
        .then(res => res.json())
        .then(res => { 
          setData(res); 
          if (res.log) {
            setLog(prev => ({ ...prev, ...res.log })); // Merge logs
            initialStepsRef.current = res.log.steps || 0;
          }
        })
        .catch(err => console.error("Data fetch error:", err));
    }
  }, [user, cycle]);

  useEffect(() => { refreshData(); }, [refreshData]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshData();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [refreshData]);

  // --- 3. LOGIC ---
  useEffect(() => {
    if (liveSteps > 0) {
      const newTotal = initialStepsRef.current + liveSteps;
      setLog(prev => ({ ...prev, steps: newTotal }));
      if (data && data.stats) {
         const stepDiff = newTotal - (log.steps || 0);
         setData(prev => ({
           ...prev,
           stats: { ...prev.stats, totalSteps: prev.stats.totalSteps + stepDiff }
         }));
      }
      const timeoutId = setTimeout(() => { updateData('steps', newTotal); }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [liveSteps]);

  const updateData = async (type, value) => {
    const numValue = Number(value);
    
    // 1. Optimistic UI Update
    if (type !== 'steps') {
        setLog(prev => ({ ...prev, [type === 'cost' ? 'dietCost' : type === 'weight' ? 'currentWeight' : type]: value }));
    }

    if (data && data.stats) {
      setData(prev => {
        const newStats = { ...prev.stats };
        if (type === 'cost') newStats.totalSpent += (numValue - (log.dietCost || 0));
        if (type === 'steps') newStats.totalSteps += (numValue - (log.steps || 0));
        if (type === 'workout') newStats.workoutsDone += (value ? 1 : -1);
        
        // Handle Weight Change Optimistically
        if (type === 'weight') {
           const weightDiff = (numValue - user.weight).toFixed(1);
           newStats.weightChange = weightDiff;
        }
        
        return { ...prev, stats: newStats };
      });
    }

    // 2. Server Sync
    await fetch('http://localhost:3000/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, type, value })
    });
  };

  const handleLogout = () => { 
    localStorage.removeItem('userId'); 
    setUser(null); setCycle(null); setData(null); setShowLanding(true); 
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-zinc-500">Loading...</div>;
  if (!user) {
    if (showLanding) return <Landing onStart={() => setShowLanding(false)} onLogin={(u, c) => { localStorage.setItem('userId', u.id); setUser(u); setCycle(c); setShowLanding(false); }} />;
    return <Onboarding onBack={() => setShowLanding(true)} onComplete={(u, c) => { localStorage.setItem('userId', u.id); setUser(u); setCycle(c); }} />;
  }
  if (!data) return <div className="h-screen bg-black flex items-center justify-center text-zinc-500">Syncing...</div>;
  if (data.error || !data.history) return <div className="h-screen flex items-center justify-center"><button onClick={handleLogout}>Reset</button></div>;

  // --- SUB-COMPONENTS ---

  const StatsCard = ({ icon: Icon, label, value, sub, isEditable, onEdit }) => (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 flex flex-col justify-between h-full shadow-sm group">
       <div className="flex items-center gap-2 mb-4 text-zinc-400">
         <div className="p-2 bg-gray-50 dark:bg-zinc-800 rounded-full text-accent"><Icon size={18} /></div>
         <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
       </div>
       <div>
         {isEditable ? (
            <div className="flex items-baseline gap-1">
               <input 
                 type="number" 
                 className="text-2xl font-bold tracking-tight bg-transparent w-20 focus:outline-none border-b border-transparent focus:border-accent transition-all" 
                 placeholder={value.replace(/[^0-9.]/g, '')} // Strip non-numeric for placeholder
                 onBlur={(e) => onEdit(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
               />
               <span className="text-sm font-bold text-zinc-500">kg</span>
            </div>
         ) : (
            <div className="text-2xl font-bold tracking-tight">{value}</div>
         )}
         {sub && <div className="text-xs text-zinc-500 mt-1">{sub}</div>}
       </div>
    </div>
  );

  const WorkoutCard = () => (
    <div className={`bg-white dark:bg-zinc-900 rounded-3xl p-8 border transition-all h-full flex flex-col justify-between ${log.workoutDone ? 'border-accent/30 dark:border-accent/30' : 'border-gray-100 dark:border-zinc-800'}`}>
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4 items-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-lg ${log.workoutDone ? 'bg-accent text-white' : 'bg-black text-white dark:bg-white dark:text-black'}`}>
              <Dumbbell size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Today's Training</h2>
              <p className="text-sm text-zinc-500">Day {(data.dayIndex || 0) + 1} • {log.workoutDone ? "Completed" : "Ready to start"}</p>
            </div>
          </div>
          <button onClick={() => updateData('workout', !log.workoutDone)} className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all ${log.workoutDone ? 'bg-accent border-accent text-white' : 'border-gray-200 dark:border-zinc-700 text-zinc-300 hover:border-accent hover:text-accent'}`}>
            <Check size={28}/>
          </button>
        </div>
        <div className={`space-y-4 ${log.workoutDone ? 'opacity-30 grayscale' : ''}`}>
          {data.workout && data.workout.length > 0 ? (
            data.workout.map((ex, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50 dark:border-zinc-800 last:border-0">
                <span className="font-semibold text-gray-900 dark:text-gray-200">{ex.name}</span>
                <span className="text-xs font-bold bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg text-gray-600 dark:text-zinc-400">{ex.sets} x {ex.reps}</span>
              </div>
            ))
          ) : <p className="text-zinc-500 italic text-sm">Active Recovery Day.</p>}
        </div>
      </div>
      {!log.workoutDone && (
        <div className="mt-6 pt-4 border-t border-dashed border-gray-200 dark:border-zinc-800">
           <div className="text-xs text-zinc-500 text-center uppercase tracking-widest font-bold">Focus: Hypertrophy</div>
        </div>
      )}
    </div>
  );

  const CycleProgress = () => {
    const cycleDuration = data.cycleDuration || 30;
    const dayIndex = data.dayIndex || 0;
    const daysLeft = cycleDuration - (dayIndex + 1);
    const visibleDots = Math.min(cycleDuration, 42); 

    return (
      <div className="bg-black dark:bg-black border border-zinc-800 text-white p-6 rounded-3xl shadow-2xl h-full flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Cycle Goal</h3>
          <div className="flex items-baseline gap-2 mb-4">
             <span className="text-5xl font-bold tracking-tighter">{Math.max(0, daysLeft)}</span>
             <span className="text-accent text-sm font-bold">DAYS LEFT</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 relative z-10">
          {Array.from({ length: visibleDots }).map((_, i) => {
            const isToday = i === dayIndex;
            const isPast = i < dayIndex;
            return <div key={i} className={`w-2 h-2 rounded-full transition-all ${isToday ? 'bg-accent scale-125' : isPast ? 'bg-zinc-700' : 'bg-zinc-900'}`} />;
          })}
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
      </div>
    );
  };

  const QuickLog = () => (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 space-y-4">
       <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-500 mb-2">Quick Log</h3>
       <div className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-950 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800">
         <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl text-accent shadow-sm"><Footprints size={18}/></div>
         <div className="flex-1">
           <div className="flex justify-between">
             <span className="text-xs font-bold text-zinc-500 uppercase">Steps</span>
             {!permissionGranted && <button onClick={requestPermission}><Play size={10} className="text-accent"/></button>}
           </div>
           <input type="number" value={log.steps || ''} onChange={(e) => updateData('steps', e.target.value)} className="w-full bg-transparent font-bold text-gray-900 dark:text-white focus:outline-none" placeholder="0" />
         </div>
       </div>
       <div className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-950 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800">
         <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl text-green-600 shadow-sm"><IndianRupee size={18}/></div>
         <div className="flex-1">
           <span className="text-xs font-bold text-zinc-500 uppercase block">Spent</span>
           <input type="number" value={log.dietCost || ''} onChange={(e) => updateData('cost', e.target.value)} className="w-full bg-transparent font-bold text-gray-900 dark:text-white focus:outline-none" placeholder="0" />
         </div>
       </div>
    </div>
  );

  const DashboardView = () => {
    const { totalSpent, totalSteps, workoutsDone, weightChange } = data.stats || { totalSpent: 0, totalSteps: 0, workoutsDone: 0, weightChange: 0 };
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard icon={Wallet} label="Spent" value={`₹${totalSpent.toLocaleString()}`} />
          <StatsCard icon={Dumbbell} label="Workouts" value={workoutsDone} sub="Sessions Completed" />
          <StatsCard icon={Footprints} label="Steps" value={`${(totalSteps / 1000).toFixed(1)}k`} sub="Total Steps" />
          
          {/* EDITABLE WEIGHT CARD */}
          <StatsCard 
            icon={Scale} 
            label="Weight" 
            value={`${Number(weightChange) > 0 ? '+' : ''}${weightChange}`} 
            sub="Update daily"
            isEditable={true}
            onEdit={(val) => updateData('weight', val)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-full"><WorkoutCard /></div>
          <div className="md:col-span-1 space-y-6 flex flex-col">
             <div className="flex-1"><CycleProgress /></div>
             <div className="flex-0"><QuickLog /></div>
          </div>
        </div>
      </div>
    );
  };

  const DietView = ({ dietPlan }) => {
    if (!dietPlan) return <div className="text-center text-zinc-500 py-10">Loading diet plan...</div>;
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-black dark:bg-white text-white dark:text-black p-8 rounded-3xl relative overflow-hidden shadow-2xl">
           <div className="relative z-10">
             <div className="flex justify-between items-start">
               <div>
                 <h2 className="text-3xl font-bold mb-1">Daily Fuel.</h2>
                 <div className="flex items-center gap-2 opacity-80">
                   <span className="text-sm font-medium uppercase tracking-wider">Protein Goal</span>
                   <span className="font-bold">{dietPlan.proteinTarget}g</span>
                 </div>
               </div>
               <div className="text-right">
                 <div className="text-4xl font-bold tracking-tighter">{dietPlan.totalCalories}</div>
                 <div className="text-xs font-bold uppercase tracking-widest opacity-60">Calories</div>
               </div>
             </div>
             {dietPlan.isRestrictedDay && (
               <div className="mt-6 inline-flex items-center gap-2 bg-white/10 dark:bg-black/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 dark:border-black/10">
                 <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                 <span className="text-xs font-bold">Today is a Veg Day</span>
               </div>
             )}
           </div>
           <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent rounded-full blur-3xl opacity-50"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dietPlan.meals.map((meal, index) => (
            <div key={index} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-gray-100 dark:border-zinc-800 flex gap-4 items-center group hover:border-accent/20 transition-all">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                meal.item.includes('Chicken') || meal.item.includes('Egg') ? 'bg-orange-50 dark:bg-orange-900/20' : 
                meal.item.includes('Paneer') || meal.item.includes('Tofu') ? 'bg-green-50 dark:bg-green-900/20' : 
                'bg-blue-50 dark:bg-blue-900/20'
              }`}>
                {meal.item.includes('Chicken') ? '🍗' : 
                 meal.item.includes('Egg') ? '🥚' : 
                 meal.item.includes('Paneer') ? '🧀' : 
                 meal.item.includes('Oats') ? '🥣' : 
                 meal.item.includes('Salad') ? '🥗' : '🍱'}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900 dark:text-white">{meal.type}</h3>
                  <span className="text-xs font-bold bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500">{meal.cal} cal</span>
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-0.5">{meal.item}</p>
                <p className="text-xs text-zinc-400 mt-1">{meal.qty} • <span className="text-accent">{meal.protein}g Protein</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const PlaceholderView = ({ title, icon: Icon }) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-400">
      <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6"><Icon size={40} /></div>
      <h2 className="text-2xl font-bold text-black dark:text-white mb-2">{title}</h2>
      <p>This module is coming in the next update.</p>
    </div>
  );

  const ProfileView = () => (
    <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 text-center mt-10">
       <div className="w-24 h-24 mx-auto bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 mb-6 text-3xl font-bold border-4 border-white dark:border-black shadow-xl">{user.name.charAt(0)}</div>
       <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
       <p className="text-sm text-zinc-500 uppercase tracking-widest mt-2">{user.email}</p>
       <div className="grid grid-cols-3 gap-4 mt-8 py-8 border-t border-b border-gray-100 dark:border-zinc-800">
         <div><div className="text-xl font-bold">{user.weight}kg</div><div className="text-[10px] text-zinc-500 uppercase mt-1">Weight</div></div>
         <div><div className="text-xl font-bold">{user.height}cm</div><div className="text-[10px] text-zinc-500 uppercase mt-1">Height</div></div>
         <div><div className="text-xl font-bold">{user.age}</div><div className="text-[10px] text-zinc-500 uppercase mt-1">Age</div></div>
       </div>
       <div className="mt-8 text-left space-y-4">
         <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-zinc-950 rounded-xl"><span className="text-sm font-bold text-zinc-500">Diet</span><span className="font-bold capitalize">{user.dietPreference}</span></div>
         <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-zinc-950 rounded-xl"><span className="text-sm font-bold text-zinc-500">Activity</span><span className="font-bold capitalize">{user.activityLevel}</span></div>
         <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-zinc-950 rounded-xl"><span className="text-sm font-bold text-zinc-500">Daily Target</span><span className="font-bold text-accent">{user.calorieTarget} kcal</span></div>
       </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black text-black dark:text-white font-sans transition-colors duration-300 selection:bg-accent selection:text-white overflow-hidden">
      <aside className="hidden md:flex w-24 flex-col items-center py-8 bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-900 z-20">
        <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black mb-12 shadow-lg"><Parentheses size={20} /></div>
        <nav className="flex-1 flex flex-col gap-6 w-full px-4">
          <button onClick={() => setActiveTab('dashboard')} className={`p-3 rounded-xl transition-all flex justify-center ${activeTab === 'dashboard' ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900'}`}><Home size={22} /></button>
          <button onClick={() => setActiveTab('diet')} className={`p-3 rounded-xl transition-all flex justify-center ${activeTab === 'diet' ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900'}`}><Utensils size={22} /></button>
          <button onClick={() => setActiveTab('stats')} className={`p-3 rounded-xl transition-all flex justify-center ${activeTab === 'stats' ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900'}`}><BarChart3 size={22} /></button>
          <button onClick={() => setActiveTab('calendar')} className={`p-3 rounded-xl transition-all flex justify-center ${activeTab === 'calendar' ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900'}`}><Calendar size={22} /></button>
          <button onClick={() => setActiveTab('profile')} className={`p-3 rounded-xl transition-all flex justify-center ${activeTab === 'profile' ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900'}`}><User size={22} /></button>
        </nav>
        <div className="flex flex-col gap-4 w-full px-4">
          <button onClick={toggleTheme} className="p-3 rounded-xl text-zinc-400 hover:text-accent transition-colors flex justify-center">{theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}</button>
          <button onClick={handleLogout} className="p-3 rounded-xl text-zinc-400 hover:text-red-500 transition-colors flex justify-center"><LogOut size={22} /></button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="md:hidden flex justify-between items-center p-6 bg-white dark:bg-black border-b border-gray-100 dark:border-zinc-900 z-20">
           <div className="flex items-center gap-2 font-bold text-lg"><Parentheses size={18}/> Inside.</div>
           <div className="flex gap-4">
             <button onClick={() => setActiveTab('profile')}><User size={20}/></button>
             <button onClick={toggleTheme}>{theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}</button>
             <button onClick={handleLogout}><LogOut size={20}/></button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-8 md:mb-10">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                  {activeTab === 'dashboard' && `Hey! ${user.name.split(' ')[0]}.`}
                  {activeTab === 'diet' && 'Nutrition Plan.'}
                  {activeTab === 'stats' && 'Your Statistics.'}
                  {activeTab === 'calendar' && 'History.'}
                  {activeTab === 'profile' && 'Your Profile.'}
                </h1>
                {activeTab === 'dashboard' && (
                  <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium">
                    <Flame size={14} className="text-accent" />
                    <span>Target: <span className="text-black dark:text-white font-bold">{user.calorieTarget}</span> kcal</span>
                  </div>
                )}
              </div>
              <div className="hidden md:block">
                 <div className="text-right">
                   <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</div>
                   <div className="text-2xl font-bold">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}</div>
                 </div>
              </div>
            </div>

            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'diet' && <DietView dietPlan={data.dietPlan} />}
            {activeTab === 'stats' && <PlaceholderView title="Statistics" icon={BarChart3} />}
            {activeTab === 'calendar' && <PlaceholderView title="Calendar" icon={Calendar} />}
            {activeTab === 'profile' && <ProfileView />}

          </div>
        </div>

        <div className="md:hidden bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-900 p-4 flex justify-around fixed bottom-0 w-full z-30">
          <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-accent' : 'text-zinc-400'}><Home size={24}/></button>
          <button onClick={() => setActiveTab('diet')} className={activeTab === 'diet' ? 'text-accent' : 'text-zinc-400'}><Utensils size={24}/></button>
          <button onClick={() => setActiveTab('stats')} className={activeTab === 'stats' ? 'text-accent' : 'text-zinc-400'}><BarChart3 size={24}/></button>
          <button onClick={() => setActiveTab('calendar')} className={activeTab === 'calendar' ? 'text-accent' : 'text-zinc-400'}><Calendar size={24}/></button>
          <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'text-accent' : 'text-zinc-400'}><User size={24}/></button>
        </div>
      </main>
    </div>
  );
}