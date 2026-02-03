import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Check, Dumbbell, Flame, LogOut, Footprints, IndianRupee, 
  Activity, Parentheses, Moon, Sun, Play, Wallet, Scale, 
  Home, Calendar, User, BarChart3, Utensils, ArrowLeft, Info, Plus, X, MessageSquare, ChevronRight
} from 'lucide-react';
import Onboarding from './Onboarding';
import Landing from './Landing';
import { useTheme } from './ThemeContext';
import { usePedometer } from './usePedometer';

// --- 1. FULL EXERCISE DATABASE ---
const EXERCISE_GUIDE = {
  // === PUSH EXERCISES ===
  "Bench Press": { type: "PUSH", desc: "The king of chest exercises. Builds raw pushing power.", steps: ["Eyes under bar.", "Grip wider than shoulders.", "Lower to mid-chest.", "Press up explosively."], muscle: "Chest" },
  "Overhead Press": { type: "PUSH", desc: "Essential for broad shoulders and core stability.", steps: ["Stand tall.", "Bar at collarbone.", "Press straight up.", "Lock elbows at top."], muscle: "Shoulders" },
  "Incline Dumbbell Press": { type: "PUSH", desc: "Targets the upper chest for a fuller look.", steps: ["Bench at 30°.", "Press DBs up.", "Lower for a stretch.", "Elbows tucked slightly."], muscle: "Upper Chest" },
  "Pec Deck / Cable Flys": { type: "PUSH", desc: "Isolates the chest muscles for width.", steps: ["Elbows slightly bent.", "Squeeze hands together.", "Control the opening."], muscle: "Chest Isolation" },
  "Tricep Pushdowns": { type: "PUSH", desc: "Isolates the triceps for arm size.", steps: ["Elbows pinned to sides.", "Push down fully.", "Squeeze at bottom."], muscle: "Triceps" },
  "Overhead Tricep Ext": { type: "PUSH", desc: "Hits the long head of the tricep.", steps: ["Arms overhead.", "Lower weight behind head.", "Extend arms fully."], muscle: "Triceps Long Head" },
  "Lateral Raises": { type: "PUSH", desc: "Builds the 'capped' look on shoulders.", steps: ["Raise arms to sides.", "Stop at shoulder height.", "Control the drop."], muscle: "Side Delts" },
  "Lateral Raises (Water Bottles)": { type: "PUSH", desc: "Home variation for side delts.", steps: ["Hold bottles.", "Raise to T-pose.", "Slow negative."], muscle: "Side Delts" },
  "Push-ups": { type: "PUSH", desc: "The classic bodyweight chest builder.", steps: ["Straight line body.", "Chest to floor.", "Lock out top."], muscle: "Chest/Tri" },
  "Pike Push-ups": { type: "PUSH", desc: "Bodyweight shoulder press mimic.", steps: ["V-shape position.", "Lower head to floor.", "Push back up."], muscle: "Shoulders" },
  "Dumbbell Floor Press": { type: "PUSH", desc: "Chest press with limited range (safe for shoulders).", steps: ["Lie on floor.", "Press weights up.", "Lower until elbows touch floor."], muscle: "Chest" },
  "Chair Dips": { type: "PUSH", desc: "Tricep blaster using furniture.", steps: ["Hands on chair.", "Lower hips.", "Push up through palms."], muscle: "Triceps" },
  "Diamond Push-ups": { type: "PUSH", desc: "Focuses heavily on triceps.", steps: ["Hands make diamond shape.", "Chest to hands.", "Push up."], muscle: "Triceps" },
  "Front Raises (Plate/Bag)": { type: "PUSH", desc: "Isolates front delts.", steps: ["Hold object in front.", "Raise to eye level.", "Lower slowly."], muscle: "Front Delts" },

  // === PULL EXERCISES ===
  "Deadlifts (or Rack Pulls)": { type: "PULL", desc: "Total back and posterior chain builder.", steps: ["Hinge hips.", "Keep back flat.", "Drive through heels.", "Lock out hips."], muscle: "Full Back" },
  "Barbell Rows": { type: "PULL", desc: "Thickness builder for the back.", steps: ["Bend over.", "Flat back.", "Pull bar to stomach."], muscle: "Mid-Back" },
  "Lat Pulldowns": { type: "PULL", desc: "Builds back width (the V-taper).", steps: ["Wide grip.", "Pull to upper chest.", "Squeeze lats."], muscle: "Lats" },
  "Chest-Supported Rows": { type: "PULL", desc: "Strict rowing without lower back strain.", steps: ["Chest on pad.", "Pull elbows back.", "Squeeze shoulder blades."], muscle: "Mid-Back" },
  "Face Pulls": { type: "PULL", desc: "Crucial for posture and rear delts.", steps: ["Pull rope to eyes.", "Rotate hands back.", "Squeeze rear delts."], muscle: "Rear Delts" },
  "Dumbbell Shrugs": { type: "PULL", desc: "Builds the upper traps.", steps: ["Hold heavy DBs.", "Shrug shoulders to ears.", "Hold.", "Lower."], muscle: "Traps" },
  "Barbell Bicep Curls": { type: "PULL", desc: "Classic bicep mass builder.", steps: ["Stand tall.", "Curl bar to chest.", "Lower slowly."], muscle: "Biceps" },
  "Hammer Curls": { type: "PULL", desc: "Targets brachialis and forearms.", steps: ["Palms facing each other.", "Curl up.", "Squeeze."], muscle: "Forearms" },
  "Dumbbell Bicep Curls": { type: "PULL", desc: "Isolation for biceps.", steps: ["Supinate wrists.", "Curl up.", "Squeeze."], muscle: "Biceps" },
  "Pull-ups (or Door Rows)": { type: "PULL", desc: "The best bodyweight back exercise.", steps: ["Hang fully.", "Pull chest to bar.", "Lower fully."], muscle: "Lats" },
  "Dumbbell Rows": { type: "PULL", desc: "Unilateral back thickness.", steps: ["Hand on bench/wall.", "Pull DB to hip.", "Stretch at bottom."], muscle: "Lats" },
  "Reverse Flys": { type: "PULL", desc: "Rear delt isolation.", steps: ["Bend over.", "Raise arms to side.", "Squeeze rear shoulder."], muscle: "Rear Delts" },
  "Reverse Flys (No Equipment)": { type: "PULL", desc: "Rear delt isolation.", steps: ["Bend over.", "Raise arms to side.", "Squeeze rear shoulder."], muscle: "Rear Delts" },
  "Superman Holds": { type: "PULL", desc: "Strengthens lower back.", steps: ["Lie on stomach.", "Lift arms and legs.", "Hold."], muscle: "Lower Back" },

  // === LEG EXERCISES ===
  "Squats": { type: "LEGS", desc: "The king of legs.", steps: ["Feet shoulder width.", "Sit back and down.", "Drive up."], muscle: "Quads/Glutes" },
  "Romanian Deadlifts": { type: "LEGS", desc: "Hamstring stretch and strength.", steps: ["Slight knee bend.", "Hinge hips back.", "Stretch hams.", "Pull up."], muscle: "Hamstrings" },
  "Leg Press": { type: "LEGS", desc: "Volume builder for quads.", steps: ["Feet on platform.", "Lower deep.", "Press up."], muscle: "Quads" },
  "Leg Extensions": { type: "LEGS", desc: "Quad isolation.", steps: ["Kick up.", "Squeeze quads hard.", "Lower slow."], muscle: "Quads" },
  "Lying Leg Curls": { type: "LEGS", desc: "Hamstring isolation.", steps: ["Curl pad to butt.", "Squeeze.", "Lower slow."], muscle: "Hamstrings" },
  "Calf Raises": { type: "LEGS", desc: "Lower leg size.", steps: ["Heels down deep.", "Press up onto toes."], muscle: "Calves" },
  "Weighted Planks": { type: "CORE", desc: "Core stability.", steps: ["Plate on back.", "Hold straight line."], muscle: "Abs" },
  "Bodyweight Squats": { type: "LEGS", desc: "High rep leg endurance.", steps: ["Sit down.", "Stand up.", "Repeat fast."], muscle: "Quads" },
  "Walking Lunges": { type: "LEGS", desc: "Dynamic leg builder.", steps: ["Step forward.", "Drop back knee.", "Drive to next step."], muscle: "Glutes/Quads" },
  "Bulgarian Split Squats": { type: "LEGS", desc: "The most painful leg exercise.", steps: ["One foot on chair behind.", "Squat with front leg."], muscle: "Quads/Glutes" },
  "Glute Bridges": { type: "LEGS", desc: "Posterior chain activator.", steps: ["Lie on back.", "Thrust hips up.", "Squeeze glutes."], muscle: "Glutes" },
  "Calf Raises (On Stair)": { type: "LEGS", desc: "Home calf builder.", steps: ["Heels off stair edge.", "Drop low.", "Raise high."], muscle: "Calves" },
  "Calf Raises (Single Leg)": { type: "LEGS", desc: "Unilateral calf work.", steps: ["One leg only.", "Heel drop.", "Raise."], muscle: "Calves" },
  "Planks": { type: "CORE", desc: "Stability.", steps: ["Elbows down.", "Straight back.", "Hold."], muscle: "Core" },
  "Side Planks": { type: "CORE", desc: "Oblique stability.", steps: ["Elbow down side.", "Lift hips.", "Hold."], muscle: "Obliques" }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [cycle, setCycle] = useState(null);
  const [data, setData] = useState(null);
  const [log, setLog] = useState({ workoutDone: false, dietFollowed: false, steps: 0, dietCost: 0, currentWeight: 0, caloriesConsumed: 0, proteinConsumed: 0, meals: [] });
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewingWorkoutDetails, setViewingWorkoutDetails] = useState(false);

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
            setLog(prev => ({ ...prev, ...res.log }));
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
    if (type !== 'steps') {
        setLog(prev => ({ ...prev, [type === 'cost' ? 'dietCost' : type === 'weight' ? 'currentWeight' : type]: value }));
    }
    if (data && data.stats) {
      setData(prev => {
        const newStats = { ...prev.stats };
        if (type === 'cost') newStats.totalSpent += (numValue - (log.dietCost || 0));
        if (type === 'steps') newStats.totalSteps += (numValue - (log.steps || 0));
        if (type === 'workout') newStats.workoutsDone += (value ? 1 : -1);
        if (type === 'weight') newStats.weightChange = (numValue - user.weight).toFixed(1);
        return { ...prev, stats: newStats };
      });
    }
    await fetch('http://localhost:3000/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, type, value })
    });
  };

  const addMeal = async (mealData) => {
    // Optimistic Update
    const newMeal = { 
      ...mealData, 
      id: Date.now().toString(),
      calories: mealData.calories ? Number(mealData.calories) : 0, 
      protein: mealData.protein ? Number(mealData.protein) : 0
    }; 
    
    if (mealData.calories) {
      setLog(prev => ({
        ...prev,
        caloriesConsumed: prev.caloriesConsumed + Number(mealData.calories),
        proteinConsumed: prev.proteinConsumed + Number(mealData.protein),
        meals: [...(prev.meals || []), newMeal]
      }));
    }

    try {
      const res = await fetch('http://localhost:3000/add-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...mealData })
      });
      const updatedLog = await res.json();
      setLog(prev => ({ ...prev, ...updatedLog }));
    } catch (error) {
      console.error("Failed to add meal", error);
    }
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
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 flex flex-col justify-between h-full shadow-sm">
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
                 placeholder={value.replace(/[^0-9.]/g, '')} 
                 onBlur={(e) => onEdit(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
               />
               <span className="text-sm font-bold text-zinc-500">kg</span>
            </div>
         ) : <div className="text-2xl font-bold tracking-tight">{value}</div>}
         {sub && <div className="text-xs text-zinc-500 mt-1">{sub}</div>}
       </div>
    </div>
  );

  const WorkoutCard = () => (
    <div 
      onClick={() => setViewingWorkoutDetails(true)} 
      className={`bg-white dark:bg-zinc-900 rounded-3xl p-8 border transition-all h-full flex flex-col justify-between cursor-pointer group hover:border-accent/50 ${log.workoutDone ? 'border-accent/30 dark:border-accent/30' : 'border-gray-100 dark:border-zinc-800'}`}
    >
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4 items-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-lg ${log.workoutDone ? 'bg-accent text-white' : 'bg-black text-white dark:bg-white dark:text-black'}`}>
              <Dumbbell size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Today's Training</h2>
              <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
                 <span className="font-medium">Day {(data.dayIndex || 0) + 1}</span>
                 <span className="inline-flex items-center justify-center text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md text-zinc-400 group-hover:bg-accent group-hover:text-white transition-colors whitespace-nowrap">
                   Tap for Guide
                 </span>
              </div>
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); updateData('workout', !log.workoutDone); }} className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all ${log.workoutDone ? 'bg-accent border-accent text-white' : 'border-gray-200 dark:border-zinc-700 text-zinc-300 hover:border-accent hover:text-accent'}`}>
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

  const WorkoutDetailView = () => {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setViewingWorkoutDetails(false)} className="p-2 bg-gray-100 dark:bg-zinc-900 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Session Guide</h1>
        </div>

        {data.workout && data.workout.length > 0 ? (
          <div className="space-y-4">
            {data.workout.map((ex, i) => {
              const info = EXERCISE_GUIDE[ex.name] || { type: "GEN", desc: "Focus on form.", steps: ["Standard execution."], muscle: "General" };
              
              // Define color based on type
              let typeColor = 'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-gray-400';
              if (info.type === 'PUSH') typeColor = 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
              if (info.type === 'PULL') typeColor = 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
              if (info.type === 'LEGS') typeColor = 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';

              return (
                <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{ex.name}</h3>
                        {/* TYPE BADGE */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${typeColor}`}>{info.type}</span>
                      </div>
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{info.muscle}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">{ex.sets} x {ex.reps}</div>
                      <div className="text-xs text-zinc-500 uppercase">Target</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 italic">"{info.desc}"</p>
                  <div className="bg-gray-50 dark:bg-zinc-950 p-4 rounded-2xl">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase mb-2 flex items-center gap-1"><Info size={12}/> Execution</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {info.steps.map((step, idx) => (
                        <li key={idx} className="text-sm text-zinc-600 dark:text-zinc-400">{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
            <button 
              onClick={() => { updateData('workout', true); setViewingWorkoutDetails(false); }} 
              className="w-full py-4 bg-accent text-white rounded-2xl font-bold text-lg shadow-lg shadow-accent/20 hover:opacity-90 transition-opacity mt-8"
            >
              Mark Session Complete
            </button>
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500">Rest Day. No exercises to show.</div>
        )}
      </div>
    );
  };

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
          {Array.from({ length: visibleDots }).map((_, i) => <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === dayIndex ? 'bg-accent scale-125' : i < dayIndex ? 'bg-zinc-700' : 'bg-zinc-900'}`} />)}
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
      </div>
    );
  };

  const QuickLog = () => {
    return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 space-y-4">
       <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-500 mb-2">Quick Log</h3>
       <div className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-950 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800">
         <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl text-accent shadow-sm"><Footprints size={18}/></div>
         <div className="flex-1"><div className="flex justify-between"><span className="text-xs font-bold text-zinc-500 uppercase">Steps</span>{!permissionGranted && <button onClick={requestPermission}><Play size={10} className="text-accent"/></button>}</div><input type="number" value={log.steps || ''} onChange={(e) => updateData('steps', e.target.value)} className="w-full bg-transparent font-bold text-gray-900 dark:text-white focus:outline-none" placeholder="0" /></div>
       </div>
       <div className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-950 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800">
         <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl text-green-600 shadow-sm"><IndianRupee size={18}/></div>
         <div className="flex-1"><span className="text-xs font-bold text-zinc-500 uppercase block">Spent</span><input type="number" value={log.dietCost || ''} onChange={(e) => updateData('cost', e.target.value)} className="w-full bg-transparent font-bold text-gray-900 dark:text-white focus:outline-none" placeholder="0" /></div>
       </div>
    </div>
    );
  };

  const DietView = ({ dietPlan }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [mealForm, setMealForm] = useState({ name: '', calories: '', protein: '' });

    if (!dietPlan) return <div className="text-center text-zinc-500 py-10">Loading...</div>;

    const calProgress = Math.min((log.caloriesConsumed / dietPlan.totalCalories) * 100, 100);
    const proProgress = Math.min((log.proteinConsumed / dietPlan.proteinTarget) * 100, 100);

    const submitMeal = (e) => {
      e.preventDefault();
      addMeal(mealForm);
      setMealForm({ name: '', calories: '', protein: '' });
      setIsAdding(false);
    };

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* STATS HEADER */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black dark:bg-white text-white dark:text-black p-6 rounded-3xl relative overflow-hidden">
             <h3 className="text-xs font-bold opacity-60 uppercase mb-1">Calories</h3>
             <div className="text-2xl font-bold tracking-tight">{log.caloriesConsumed} <span className="text-sm opacity-50">/ {dietPlan.totalCalories}</span></div>
             <div className="mt-3 h-2 bg-white/20 dark:bg-black/10 rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: `${calProgress}%` }}></div>
             </div>
             <div className="mt-1 text-right text-[10px] font-bold">{dietPlan.totalCalories - log.caloriesConsumed} Left</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-6 rounded-3xl">
             <h3 className="text-xs font-bold text-zinc-400 uppercase mb-1">Protein</h3>
             <div className="text-2xl font-bold tracking-tight">{log.proteinConsumed}g <span className="text-sm text-zinc-500">/ {dietPlan.proteinTarget}g</span></div>
             <div className="mt-3 h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${proProgress}%` }}></div>
             </div>
             <div className="mt-1 text-right text-[10px] font-bold text-zinc-400">{dietPlan.proteinTarget - log.proteinConsumed}g Left</div>
          </div>
        </div>

        {/* TODAY'S LOGS */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Today's Meals</h3>
            <button onClick={() => setIsAdding(true)} className="flex items-center gap-1 text-xs font-bold bg-accent text-white px-3 py-1.5 rounded-full hover:opacity-90"><Plus size={14}/> Add</button>
          </div>

          {/* ADD MEAL FORM */}
          {isAdding && (
            <form onSubmit={submitMeal} className="bg-gray-50 dark:bg-zinc-900 p-4 rounded-2xl mb-4 border border-accent/20 animate-in slide-in-from-top-2">
              <div className="flex justify-between mb-2"><h4 className="text-xs font-bold uppercase text-accent">Auto-Estimate Entry</h4><button type="button" onClick={() => setIsAdding(false)}><X size={14}/></button></div>
              <input required placeholder="Food Name (e.g. 2 Eggs, Chicken Rice...)" className="w-full mb-2 p-2 bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 text-sm font-bold" value={mealForm.name} onChange={e => setMealForm({...mealForm, name: e.target.value})} />
              <div className="flex gap-2">
                <input type="number" placeholder="Cals (Optional)" className="w-1/2 p-2 bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 text-sm" value={mealForm.calories} onChange={e => setMealForm({...mealForm, calories: e.target.value})} />
                <input type="number" placeholder="Protein (Optional)" className="w-1/2 p-2 bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 text-sm" value={mealForm.protein} onChange={e => setMealForm({...mealForm, protein: e.target.value})} />
              </div>
              <p className="text-[10px] text-zinc-400 mt-2 mb-2 italic">*Leave numbers blank to auto-calculate based on food name.</p>
              <button type="submit" className="w-full mt-2 bg-black dark:bg-white text-white dark:text-black py-2 rounded-lg text-xs font-bold">Log Meal</button>
            </form>
          )}

          <div className="space-y-3">
            {log.meals && log.meals.length > 0 ? (
              log.meals.map((m, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl">
                  <div>
                    <div className="font-bold text-sm">{m.name}</div>
                    <div className="text-xs text-zinc-500">{m.calories} kcal</div>
                  </div>
                  <div className="text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">{m.protein}g Pro</div>
                </div>
              ))
            ) : <div className="text-center text-zinc-400 text-sm py-4">No meals logged today.</div>}
          </div>
        </div>

        {/* SUGGESTED PLAN (Reference) */}
        <div className="opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <h3 className="font-bold text-sm text-zinc-500 uppercase tracking-wider mb-4 mt-8">Suggested Plan</h3>
          <div className="space-y-3">
            {dietPlan.meals.map((meal, index) => (
              <div key={index} className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-zinc-800">
                <span className="text-sm font-medium">{meal.item}</span>
                <span className="text-xs font-bold text-zinc-400">{meal.qty}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const DashboardView = () => {
    const { totalSpent, totalSteps, workoutsDone, weightChange } = data.stats || { totalSpent: 0, totalSteps: 0, workoutsDone: 0, weightChange: 0 };
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard icon={Wallet} label="Spent" value={`₹${totalSpent.toLocaleString()}`} />
          <StatsCard icon={Dumbbell} label="Workouts" value={workoutsDone} sub="Sessions Completed" />
          <StatsCard icon={Footprints} label="Steps" value={`${(totalSteps / 1000).toFixed(1)}k`} sub="Total Steps" />
          <StatsCard icon={Scale} label="Weight" value={`${Number(weightChange) > 0 ? '+' : ''}${weightChange}`} sub="Update daily" isEditable={true} onEdit={(val) => updateData('weight', val)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-full"><WorkoutCard /></div>
          <div className="md:col-span-1 space-y-6 flex flex-col"><div className="flex-1"><CycleProgress /></div><div className="flex-0"><QuickLog /></div></div>
        </div>
      </div>
    );
  };

  const PlaceholderView = ({ title, icon: Icon }) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-400"><div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6"><Icon size={40} /></div><h2 className="text-2xl font-bold text-black dark:text-white mb-2">{title}</h2><p>This module is coming in the next update.</p></div>
  );

  const ProfileView = () => (
    <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 text-center mt-10">
       <div className="w-24 h-24 mx-auto bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 mb-6 text-3xl font-bold border-4 border-white dark:border-black shadow-xl">{user.name.charAt(0)}</div><h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2><p className="text-sm text-zinc-500 uppercase tracking-widest mt-2">{user.email}</p>
       <div className="grid grid-cols-3 gap-4 mt-8 py-8 border-t border-b border-gray-100 dark:border-zinc-800"><div><div className="text-xl font-bold">{user.weight}kg</div><div className="text-[10px] text-zinc-500 uppercase mt-1">Weight</div></div><div><div className="text-xl font-bold">{user.height}cm</div><div className="text-[10px] text-zinc-500 uppercase mt-1">Height</div></div><div><div className="text-xl font-bold">{user.age}</div><div className="text-[10px] text-zinc-500 uppercase mt-1">Age</div></div></div>
       <div className="mt-8 text-left space-y-4"><div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-zinc-950 rounded-xl"><span className="text-sm font-bold text-zinc-500">Diet</span><span className="font-bold capitalize">{user.dietPreference}</span></div><div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-zinc-950 rounded-xl"><span className="text-sm font-bold text-zinc-500">Activity</span><span className="font-bold capitalize">{user.activityLevel}</span></div><div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-zinc-950 rounded-xl"><span className="text-sm font-bold text-zinc-500">Daily Target</span><span className="font-bold text-accent">{user.calorieTarget} kcal</span></div></div>
    </div>
  );

  // 👇 CHAT BOT COMPONENT
  const ChatView = () => {
    const [msg, setMsg] = useState('');
    const [chatHistory, setChatHistory] = useState([
      { role: 'bot', text: "I'm BaseLayer Coach. How can I help you today?" }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

    const sendChat = async (e) => {
      e.preventDefault();
      if (!msg.trim()) return;

      const userText = msg;
      setMsg('');
      setChatHistory(prev => [...prev, { role: 'user', text: userText }]);
      setIsTyping(true);

      try {
        const res = await fetch('http://localhost:3000/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userText })
        });
        const data = await res.json();
        setChatHistory(prev => [...prev, { role: 'bot', text: data.reply }]);
      } catch (err) {
        setChatHistory(prev => [...prev, { role: 'bot', text: "Connection error. Try again." }]);
      } finally {
        setIsTyping(false);
      }
    };

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

    return (
      <div className="flex flex-col h-[75vh] bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-300">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white"><MessageSquare size={20}/></div>
          <div><h3 className="font-bold">BaseLayer Coach</h3><div className="text-xs text-green-500 font-bold flex items-center gap-1">● Online</div></div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.map((c, i) => (
            <div key={i} className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                c.role === 'user' 
                ? 'bg-black text-white dark:bg-white dark:text-black rounded-tr-none' 
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 rounded-tl-none'
              }`}>
                {c.text}
              </div>
            </div>
          ))}
          {isTyping && <div className="text-xs text-zinc-400 animate-pulse ml-2">Coach is typing...</div>}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={sendChat} className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 flex gap-2">
          <input 
            value={msg} 
            onChange={e => setMsg(e.target.value)} 
            placeholder="Ask about diet, form, or pain..." 
            className="flex-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
          />
          <button type="submit" className="p-3 bg-accent text-white rounded-xl hover:opacity-90 transition-opacity"><ChevronRight size={20}/></button>
        </form>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black text-black dark:text-white font-sans transition-colors duration-300 selection:bg-accent selection:text-white overflow-hidden">
      <aside className="hidden md:flex w-24 flex-col items-center py-8 bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-900 z-20">
        <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black mb-12 shadow-lg"><Parentheses size={20} /></div>
        <nav className="flex-1 flex flex-col gap-6 w-full px-4">
          <button onClick={() => { setActiveTab('dashboard'); setViewingWorkoutDetails(false); }} className={`p-3 rounded-xl transition-all flex justify-center ${activeTab === 'dashboard' ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900'}`}><Home size={22} /></button>
          <button onClick={() => { setActiveTab('diet'); setViewingWorkoutDetails(false); }} className={`p-3 rounded-xl transition-all flex justify-center ${activeTab === 'diet' ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900'}`}><Utensils size={22} /></button>
          <button onClick={() => { setActiveTab('stats'); setViewingWorkoutDetails(false); }} className={`p-3 rounded-xl transition-all flex justify-center ${activeTab === 'stats' ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900'}`}><BarChart3 size={22} /></button>
          <button onClick={() => { setActiveTab('calendar'); setViewingWorkoutDetails(false); }} className={`p-3 rounded-xl transition-all flex justify-center ${activeTab === 'calendar' ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900'}`}><Calendar size={22} /></button>
          <button onClick={() => { setActiveTab('profile'); setViewingWorkoutDetails(false); }} className={`p-3 rounded-xl transition-all flex justify-center ${activeTab === 'profile' ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900'}`}><User size={22} /></button>
          {/* CHAT BUTTON */}
          <button onClick={() => { setActiveTab('chat'); setViewingWorkoutDetails(false); }} className={`p-3 rounded-xl transition-all flex justify-center ${activeTab === 'chat' ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900'}`}><MessageSquare size={22} /></button>
        </nav>
        <div className="flex flex-col gap-4 w-full px-4"><button onClick={toggleTheme} className="p-3 rounded-xl text-zinc-400 hover:text-accent transition-colors flex justify-center">{theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}</button><button onClick={handleLogout} className="p-3 rounded-xl text-zinc-400 hover:text-red-500 transition-colors flex justify-center"><LogOut size={22} /></button></div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="md:hidden flex justify-between items-center p-6 bg-white dark:bg-black border-b border-gray-100 dark:border-zinc-900 z-20"><div className="flex items-center gap-2 font-bold text-lg"><Parentheses size={18}/> Inside.</div><div className="flex gap-4"><button onClick={() => setActiveTab('profile')}><User size={20}/></button><button onClick={toggleTheme}>{theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}</button><button onClick={handleLogout}><LogOut size={20}/></button></div></div>

        <div className="flex-1 overflow-y-auto p-6 pb-28 md:p-10">
          <div className="max-w-7xl mx-auto">
            {!viewingWorkoutDetails && (
              <div className="flex justify-between items-end mb-8 md:mb-10">
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                    {activeTab === 'dashboard' && `Hey! ${user.name.split(' ')[0]}.`}
                    {activeTab === 'diet' && 'Nutrition Plan.'}
                    {activeTab === 'stats' && 'Your Statistics.'}
                    {activeTab === 'calendar' && 'History.'}
                    {activeTab === 'profile' && 'Your Profile.'}
                    {activeTab === 'chat' && 'AI Coach.'}
                  </h1>
                  {activeTab === 'dashboard' && (<div className="flex items-center gap-2 text-zinc-500 text-sm font-medium"><Flame size={14} className="text-accent" /><span>Target: <span className="text-black dark:text-white font-bold">{user.calorieTarget}</span> kcal</span></div>)}
                </div>
                <div className="hidden md:block"><div className="text-right"><div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</div><div className="text-2xl font-bold">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}</div></div></div>
              </div>
            )}

            {activeTab === 'dashboard' ? (
               viewingWorkoutDetails ? <WorkoutDetailView /> : <DashboardView />
            ) : null}
            
            {activeTab === 'diet' && <DietView dietPlan={data.dietPlan} />}
            {activeTab === 'stats' && <PlaceholderView title="Statistics" icon={BarChart3} />}
            {activeTab === 'calendar' && <PlaceholderView title="Calendar" icon={Calendar} />}
            {activeTab === 'profile' && <ProfileView />}
            {activeTab === 'chat' && <ChatView />}

          </div>
        </div>

        <div className="md:hidden bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-900 p-4 flex justify-around fixed bottom-0 w-full z-30">
          <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-accent' : 'text-zinc-400'}><Home size={24}/></button>
          <button onClick={() => setActiveTab('diet')} className={activeTab === 'diet' ? 'text-accent' : 'text-zinc-400'}><Utensils size={24}/></button>
          <button onClick={() => setActiveTab('stats')} className={activeTab === 'stats' ? 'text-accent' : 'text-zinc-400'}><BarChart3 size={24}/></button>
          <button onClick={() => setActiveTab('calendar')} className={activeTab === 'calendar' ? 'text-accent' : 'text-zinc-400'}><Calendar size={24}/></button>
          <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'text-accent' : 'text-zinc-400'}><User size={24}/></button>
          <button onClick={() => setActiveTab('chat')} className={activeTab === 'chat' ? 'text-accent' : 'text-zinc-400'}><MessageSquare size={24}/></button>
        </div>
      </main>
    </div>
  );
}